/**
 * Admin User Service
 * 
 * This service handles admin operations for user and MUA management including:
 * - User pagination and filtering
 * - MUA management and approval
 * - User status management (ban/unban)
 * - Statistics and reporting
 */

import { User } from "../models/users.models";
import { MUA } from "../models/muas.models";
import { Booking } from "../models/bookings.models";
import { USER_ROLES, USER_STATUS, MUA_STATUS } from "../constants/index";
import type {
  AdminUserQueryDTO,
  AdminMUAQueryDTO,
  AdminUserListResponseDTO,
  AdminMUAListResponseDTO,
  AdminUserResponseDTO,
  AdminMUAResponseDTO,
  BanUserDTO,
  ApproveMUADTO,
  RejectMUADTO,
  BulkBanUsersDTO,
  BulkApproveMUAsDTO,
  UserStatisticsDTO,
  MUAStatisticsDTO
} from "../types/admin.user.dto";

// ==================== USER MANAGEMENT ====================

/**
 * Get paginated list of users with filtering
 */
export async function getUsers(query: AdminUserQueryDTO = {}): Promise<AdminUserListResponseDTO> {
  try {
    const {
      page = 1,
      pageSize = 10,
      role,
      status = 'all',
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      fromDate,
      toDate
    } = query;

    const skip = (page - 1) * pageSize;
    
    // Build filter conditions
    const filter: any = {};
    
    // Role filter
    if (role && role !== 'all') {
      filter.role = role;
    }
    
    // Status filter
    if (status !== 'all') {
      filter.status = status;
    }
    
    // Search filter
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Date range filter
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }
    
    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute queries
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -refreshToken')
        .skip(skip)
        .limit(pageSize)
        .sort(sort)
        .exec(),
      User.countDocuments(filter)
    ]);

    // Get statistics
    const [totalUsers, activeUsers, bannedUsers] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ status: USER_STATUS.ACTIVE }),
      User.countDocuments({ status: USER_STATUS.BANNED })
    ]);

    // Get new users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Format users
    const formattedUsers: AdminUserResponseDTO[] = users.map(user => ({
      _id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      role: user.role as any,
      status: user.status,
      isEmailVerified: user.isEmailVerified || false,
      isBanned: user.status === USER_STATUS.BANNED,
      avatarUrl: user.avatarUrl || '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastLogin,
      banReason: (user as any).banReason,
      bannedAt: (user as any).bannedAt
    }));

    return {
      users: formattedUsers,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasMore: page * pageSize < total
      },
      statistics: {
        totalUsers,
        activeUsers,
        bannedUsers,
        newUsersThisMonth
      }
    };
  } catch (error) {
    throw new Error(`Failed to get users: ${error}`);
  }
}

/**
 * Get user by ID with full details
 */
export async function getUserById(userId: string): Promise<AdminUserResponseDTO | null> {
  try {
    const user = await User.findById(userId)
      .select('-password -refreshToken')
      .exec();

    if (!user) {
      return null;
    }

    return {
      _id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      role: user.role as any,
      status: user.status,
      isEmailVerified: user.isEmailVerified || false,
      isBanned: user.status === USER_STATUS.BANNED,
      avatarUrl: user.avatarUrl || '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastLogin,
      banReason: (user as any).banReason,
      bannedAt: (user as any).bannedAt
    };
  } catch (error) {
    throw new Error(`Failed to get user: ${error}`);
  }
}

/**
 * Ban a user
 */
export async function banUser(userId: string, banData: BanUserDTO = {}): Promise<AdminUserResponseDTO> {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        status: USER_STATUS.BANNED,
        banReason: banData.reason,
        bannedAt: new Date(),
        updatedAt: new Date()
      } as any,
      { new: true, select: '-password -refreshToken' }
    ).exec();

    if (!user) {
      throw new Error('User not found');
    }

    return {
      _id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      role: user.role as any,
      status: user.status,
      isEmailVerified: user.isEmailVerified || false,
      isBanned: user.status === USER_STATUS.BANNED,
      avatarUrl: user.avatarUrl || '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastLogin,
      banReason: (user as any).banReason,
      bannedAt: (user as any).bannedAt
    };
  } catch (error) {
    throw new Error(`Failed to ban user: ${error}`);
  }
}

/**
 * Unban a user
 */
export async function unbanUser(userId: string): Promise<AdminUserResponseDTO> {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        status: USER_STATUS.ACTIVE,
        $unset: { banReason: 1, bannedAt: 1 },
        updatedAt: new Date()
      } as any,
      { new: true, select: '-password -refreshToken' }
    ).exec();

    if (!user) {
      throw new Error('User not found');
    }

    return {
      _id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      role: user.role as any,
      status: user.status,
      isEmailVerified: user.isEmailVerified || false,
      isBanned: user.status === USER_STATUS.BANNED,
      avatarUrl: user.avatarUrl || '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastLogin,
      banReason: (user as any).banReason,
      bannedAt: (user as any).bannedAt
    };
  } catch (error) {
    throw new Error(`Failed to unban user: ${error}`);
  }
}

/**
 * Bulk ban users
 */
export async function bulkBanUsers(bulkData: BulkBanUsersDTO): Promise<{ successful: number; failed: number; total: number }> {
  try {
    const { userIds, reason } = bulkData;
    
    const results = await Promise.allSettled(
      userIds.map(userId => banUser(userId, { reason }))
    );
    
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;
    
    return {
      successful,
      failed,
      total: userIds.length
    };
  } catch (error) {
    throw new Error(`Failed to bulk ban users: ${error}`);
  }
}

// ==================== MUA MANAGEMENT ====================

/**
 * Get paginated list of MUAs with filtering
 */
export async function getMUAs(query: AdminMUAQueryDTO = {}): Promise<AdminMUAListResponseDTO> {
  try {
    const {
      page = 1,
      pageSize = 10,
      status = 'all',
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      fromDate,
      toDate
    } = query;

    const skip = (page - 1) * pageSize;
    
    // Build filter conditions
    const filter: any = {};
    
    // Status filter
    if (status !== 'all') {
      filter.status = status;
    }
    
    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Date range filter
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }
    
    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute queries with user population
    const [muas, total] = await Promise.all([
      MUA.find(filter)
        .populate('userId', 'fullName email phoneNumber avatarUrl status isEmailVerified')
        .skip(skip)
        .limit(pageSize)
        .sort(sort)
        .exec(),
      MUA.countDocuments(filter)
    ]);

    // Get statistics
    const [totalMUAs, pendingMUAs, approvedMUAs, rejectedMUAs] = await Promise.all([
      MUA.countDocuments({}),
      MUA.countDocuments({ status: MUA_STATUS.PENDING }),
      MUA.countDocuments({ status: MUA_STATUS.APPROVED }),
      MUA.countDocuments({ status: MUA_STATUS.REJECTED })
    ]);

    // Get booking counts for each MUA
    const muaIds = muas.map(mua => mua._id);
    const bookingCounts = await Booking.aggregate([
      { $match: { muaId: { $in: muaIds } } },
      { $group: { _id: '$muaId', count: { $sum: 1 } } }
    ]);

    const bookingCountMap = bookingCounts.reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {} as Record<string, number>);

    // Format MUAs
    const formattedMUAs: AdminMUAResponseDTO[] = muas.map(mua => {
      const populatedUser = mua.userId as any;
      return {
        _id: mua._id.toString(),
        userId: mua.userId?.toString() || '',
        userName: populatedUser?.fullName,
        name: populatedUser?.fullName || '',
        bio: mua.bio || '',
        experience: (mua as any).experienceYears || 0,
        rating: (mua as any).ratingAverage || 0,
        bookingCount: bookingCountMap[mua._id.toString()] || 0,
        profilePicture: populatedUser?.avatarUrl || '',
        location: mua.location || '',
        isAvailable: (mua as any).isVerified || false,
        status: (mua as any).status || MUA_STATUS.PENDING,
        createdAt: mua.createdAt,
        updatedAt: mua.updatedAt,
        rejectionReason: (mua as any).rejectionReason || undefined,
        user: populatedUser ? {
          _id: populatedUser._id.toString(),
          fullName: populatedUser.fullName,
          email: populatedUser.email,
          phoneNumber: populatedUser.phoneNumber || '',
          role: populatedUser.role as any,
          status: populatedUser.status,
          isEmailVerified: populatedUser.isEmailVerified || false,
          isBanned: populatedUser.status === USER_STATUS.BANNED,
          avatarUrl: populatedUser.avatarUrl || '',
          createdAt: populatedUser.createdAt
        } : undefined
      };
    });

    return {
      muas: formattedMUAs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasMore: page * pageSize < total
      },
      statistics: {
        totalMUAs,
        pendingMUAs,
        approvedMUAs,
        rejectedMUAs
      }
    };
  } catch (error) {
    throw new Error(`Failed to get MUAs: ${error}`);
  }
}

/**
 * Get MUA by ID with full details
 */
export async function getMUAById(muaId: string): Promise<AdminMUAResponseDTO | null> {
  try {
    const mua = await MUA.findById(muaId)
      .populate('userId', 'fullName email phoneNumber avatarUrl status isEmailVerified')
      .exec();

    if (!mua) {
      return null;
    }

    // Get booking count
    const bookingCount = await Booking.countDocuments({ muaId: mua._id });

    const populatedUser = mua.userId as any;
    return {
      _id: mua._id.toString(),
      userId: mua.userId?.toString() || '',
      userName: populatedUser?.fullName,
      name: populatedUser?.fullName || '',
      bio: mua.bio || '',
      experience: (mua as any).experienceYears || 0,
      rating: (mua as any).ratingAverage || 0,
      bookingCount,
      profilePicture: populatedUser?.avatarUrl || '',
      location: mua.location || '',
      isAvailable: (mua as any).isVerified || false,
      status: (mua as any).status || MUA_STATUS.PENDING,
      createdAt: mua.createdAt,
      updatedAt: mua.updatedAt,
      rejectionReason: (mua as any).rejectionReason || undefined,
      user: populatedUser ? {
        _id: populatedUser._id.toString(),
        fullName: populatedUser.fullName,
        email: populatedUser.email,
        phoneNumber: populatedUser.phoneNumber || '',
        role: populatedUser.role as any,
        status: populatedUser.status,
        isEmailVerified: populatedUser.isEmailVerified || false,
        isBanned: populatedUser.status === USER_STATUS.BANNED,
        avatarUrl: populatedUser.avatarUrl || '',
        createdAt: populatedUser.createdAt
      } : undefined
    };
  } catch (error) {
    throw new Error(`Failed to get MUA: ${error}`);
  }
}

/**
 * Approve a MUA application
 */
export async function approveMUA(muaId: string, approveData: ApproveMUADTO = {}): Promise<AdminMUAResponseDTO> {
  try {
    const mua = await MUA.findByIdAndUpdate(
      muaId,
      { 
        status: MUA_STATUS.APPROVED,
        approvedAt: new Date(),
        adminNotes: approveData.adminNotes,
        updatedAt: new Date()
      } as any,
      { new: true }
    ).populate('userId', 'fullName email phoneNumber avatarUrl status isEmailVerified').exec();

    if (!mua) {
      throw new Error('MUA not found');
    }

    // Update user role to ARTIST if approved
    await User.findByIdAndUpdate(mua.userId, { 
      role: USER_ROLES.ARTIST,
      updatedAt: new Date()
    });

    // Get booking count
    const bookingCount = await Booking.countDocuments({ muaId: mua._id });

    const populatedUser = mua.userId as any;
    return {
      _id: mua._id.toString(),
      userId: mua.userId?.toString() || '',
      userName: populatedUser?.fullName,
      name: populatedUser?.fullName || '',
      bio: mua.bio || '',
      experience: (mua as any).experienceYears || 0,
      rating: (mua as any).ratingAverage || 0,
      bookingCount,
      profilePicture: populatedUser?.avatarUrl || '',
      location: mua.location || '',
      isAvailable: (mua as any).isVerified || false,
      status: (mua as any).status || MUA_STATUS.APPROVED,
      createdAt: mua.createdAt,
      updatedAt: mua.updatedAt,
      rejectionReason: (mua as any).rejectionReason || undefined,
      user: populatedUser ? {
        _id: populatedUser._id.toString(),
        fullName: populatedUser.fullName,
        email: populatedUser.email,
        phoneNumber: populatedUser.phoneNumber || '',
        role: populatedUser.role as any,
        status: populatedUser.status,
        isEmailVerified: populatedUser.isEmailVerified || false,
        isBanned: populatedUser.status === USER_STATUS.BANNED,
        avatarUrl: populatedUser.avatarUrl || '',
        createdAt: populatedUser.createdAt
      } : undefined
    };
  } catch (error) {
    throw new Error(`Failed to approve MUA: ${error}`);
  }
}

/**
 * Reject a MUA application
 */
export async function rejectMUA(muaId: string, rejectData: RejectMUADTO): Promise<AdminMUAResponseDTO> {
  try {
    const mua = await MUA.findByIdAndUpdate(
      muaId,
      { 
        status: MUA_STATUS.REJECTED,
        rejectedAt: new Date(),
        rejectionReason: rejectData.reason,
        updatedAt: new Date()
      } as any,
      { new: true }
    ).populate('userId', 'fullName email phoneNumber avatarUrl status isEmailVerified').exec();

    if (!mua) {
      throw new Error('MUA not found');
    }

    // Get booking count
    const bookingCount = await Booking.countDocuments({ muaId: mua._id });

    const populatedUser = mua.userId as any;
    return {
      _id: mua._id.toString(),
      userId: mua.userId?.toString() || '',
      userName: populatedUser?.fullName,
      name: populatedUser?.fullName || '',
      bio: mua.bio || '',
      experience: (mua as any).experienceYears || 0,
      rating: (mua as any).ratingAverage || 0,
      bookingCount,
      profilePicture: populatedUser?.avatarUrl || '',
      location: mua.location || '',
      isAvailable: (mua as any).isVerified || false,
      status: (mua as any).status || MUA_STATUS.REJECTED,
      createdAt: mua.createdAt,
      updatedAt: mua.updatedAt,
      rejectionReason: rejectData.reason,
      user: populatedUser ? {
        _id: populatedUser._id.toString(),
        fullName: populatedUser.fullName,
        email: populatedUser.email,
        phoneNumber: populatedUser.phoneNumber || '',
        role: populatedUser.role as any,
        status: populatedUser.status,
        isEmailVerified: populatedUser.isEmailVerified || false,
        isBanned: populatedUser.status === USER_STATUS.BANNED,
        avatarUrl: populatedUser.avatarUrl || '',
        createdAt: populatedUser.createdAt
      } : undefined
    };
  } catch (error) {
    throw new Error(`Failed to reject MUA: ${error}`);
  }
}

/**
 * Bulk approve MUA applications
 */
export async function bulkApproveMUAs(bulkData: BulkApproveMUAsDTO): Promise<{ successful: number; failed: number; total: number }> {
  try {
    const { muaIds, adminNotes } = bulkData;
    
    const results = await Promise.allSettled(
      muaIds.map(muaId => approveMUA(muaId, { adminNotes }))
    );
    
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;
    
    return {
      successful,
      failed,
      total: muaIds.length
    };
  } catch (error) {
    throw new Error(`Failed to bulk approve MUAs: ${error}`);
  }
}

// ==================== STATISTICS ====================

/**
 * Get user statistics
 */
export async function getUserStatistics(): Promise<UserStatisticsDTO> {
  try {
    const [totalUsers, activeUsers, bannedUsers] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ status: USER_STATUS.ACTIVE }),
      User.countDocuments({ status: USER_STATUS.BANNED })
    ]);

    // Get new users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Get users by role
    const userRoleCounts = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const usersByRole = userRoleCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as { [key in typeof USER_ROLES[keyof typeof USER_ROLES]]: number });

    return {
      totalUsers,
      activeUsers,
      bannedUsers,
      newUsersThisMonth,
      usersByRole
    };
  } catch (error) {
    throw new Error(`Failed to get user statistics: ${error}`);
  }
}

/**
 * Get MUA statistics
 */
export async function getMUAStatistics(): Promise<MUAStatisticsDTO> {
  try {
    const [totalMUAs, pendingMUAs, approvedMUAs, rejectedMUAs] = await Promise.all([
      MUA.countDocuments({}),
      MUA.countDocuments({ status: MUA_STATUS.PENDING }),
      MUA.countDocuments({ status: MUA_STATUS.APPROVED }),
      MUA.countDocuments({ status: MUA_STATUS.REJECTED })
    ]);

    // Get approved/rejected this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const [approvedThisMonth, rejectedThisMonth] = await Promise.all([
      MUA.countDocuments({
        status: MUA_STATUS.APPROVED,
        approvedAt: { $gte: startOfMonth }
      }),
      MUA.countDocuments({
        status: MUA_STATUS.REJECTED,
        rejectedAt: { $gte: startOfMonth }
      })
    ]);

    return {
      totalMUAs,
      pendingMUAs,
      approvedMUAs,
      rejectedMUAs,
      approvedThisMonth,
      rejectedThisMonth
    };
  } catch (error) {
    throw new Error(`Failed to get MUA statistics: ${error}`);
  }
}
