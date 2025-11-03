# Kế hoạch triển khai Internationalization (i18n) cho AURA Booking Platform
## Sử dụng hệ thống i18n thuần túy (Custom i18n)

## 1. Mục tiêu và Nguyên tắc vàng

### Mục tiêu chính
- Hoàn thiện hệ thống đa ngôn ngữ (Tiếng Việt/Tiếng Anh) cho AURA Booking Platform
- Giữ nguyên trải nghiệm người dùng và thiết kế UI hiện tại
- Đảm bảo hiệu suất không bị ảnh hưởng
- Sử dụng hệ thống i18n tự xây dựng đã có sẵn

### Nguyên tắc vàng
1. **Ít thay đổi file nhất**: Chỉ tập trung vào các file cần thiết
2. **Giữ nguyên UI/font**: Chỉ thay đổi nội dung text, không thay đổi giao diện
3. **Code clean**: Sử dụng comment tiếng Việt, code dễ hiểu
4. **Tối ưu hiệu suất**: Đảm bảo tốc độ tải trang không bị ảnh hưởng
5. **Dễ bảo trì**: Cấu trúc rõ ràng, dễ dàng thêm ngôn ngữ mới sau này

## 2. Phân tích hệ thống i18n hiện tại

### 2.1 Cấu trúc hiện có
```
apps/frontend/src/i18n/
├── context/
│   └── I18nContext.tsx      # Context provider cho i18n
├── hooks/
│   └── useTranslate.ts      # Custom hook để sử dụng translations
└── messages/
    ├── en/
    │   ├── generalUI.json   # UI chung
    │   └── sections.json    # Các section trang chủ
    └── vi/
        ├── generalUI.json   # UI chung
        └── sections.json    # Các section trang chủ
```

### 2.2 Components đã triển khai i18n
- ✅ `Navbar.tsx` - Đã sử dụng useTranslate('generalUI')
- ✅ `FeaturedArtists.tsx` - Đã sử dụng useTranslate('sections')
- ✅ `LanguageSwitcher.tsx` - Đã hoàn thiện
- ✅ `I18nContext.tsx` - Đã có sẵn
- ✅ `useTranslate.ts` - Đã có sẵn

### 2.3 Components chưa triển khai i18n
- ❌ `LoginForm.tsx` - Vẫn hardcode text
- ❌ `ArtistNavbar.tsx` - Vẫn hardcode text
- ❌ Các auth components khác
- ❌ User dashboard components
- ❌ Artist management components
- ❌ Admin components

## 3. Custom i18n CODING GUIDELINES

### 3.1 Cách sử dụng useTranslate hook

```typescript
// Import hook
import { useTranslate } from '@/i18n/hooks/useTranslate';

// Sử dụng trong component
function MyComponent() {
  // Khởi tạo với namespace
  const { t, locale, loading } = useTranslate('auth'); // Sử dụng namespace 'auth'
  
  // Sử dụng translation key
  return (
    <div>
      <h1>{t('login.title')}</h1> // auth.login.title
      <p>{t('common.save')}</p> // auth.common.save
    </div>
  );
}
```

### 3.2 Quy tắc đặt tên translation keys

1. **Cấu trúc key**: `[namespace].[feature].[component].[element]`
2. **Naming convention**: 
   - Sử dụng lowercase với dấu chấm phân cấp
   - Tên key phải mô tả rõ nội dung
   - Trùng tên với component/function khi có thể

3. **Ví dụ đặt tên key**:
   ```json
   {
     "auth": {
       "login": {
         "title": "Đăng nhập",
         "email": "Email",
         "password": "Mật khẩu",
         "submit": "Đăng nhập",
         "forgotPassword": "Quên mật khẩu?",
         "noAccount": "Chưa có tài khoản?",
         "signUp": "Đăng ký"
       },
       "register": {
         "title": "Đăng ký",
         "firstName": "Tên",
         "lastName": "Họ",
         "email": "Email",
         "password": "Mật khẩu",
         "confirmPassword": "Xác nhận mật khẩu",
         "submit": "Đăng ký",
         "hasAccount": "Đã có tài khoản?",
         "signIn": "Đăng nhập"
       }
     },
     "user": {
       "profile": {
         "title": "Hồ sơ cá nhân",
         "edit": "Chỉnh sửa",
         "save": "Lưu",
         "cancel": "Hủy"
       }
     }
   }
   ```

### 3.3 Cách xử lý interpolation

```typescript
// Translation file
{
  "welcome": "Chào mừng {name}, bạn có {unreadCount} tin nhắn chưa đọc"
}

// Component
const { t } = useTranslate('common');
const message = t('welcome', { 
  name: 'John', 
  unreadCount: 5 
}); // Cần implement interpolation trong useTranslate hook
```

### 3.4 Best practices cho performance

1. **Lazy loading messages**: Hệ thống hiện tại đã hỗ trợ dynamic import
2. **Memoization**: Sử dụng useMemo cho các translations phức tạp
3. **Avoid unnecessary re-renders**: Hook đã được tối ưu
4. **Client-side only**: Hệ thống hiện tại chỉ hoạt động client-side

### 3.5 Code conventions và comment rules

1. **Import statements**:
   ```typescript
   // Đặt ở đầu file, sau các imports từ React
   import { useTranslate } from '@/i18n/hooks/useTranslate';
   ```

2. **Variable naming**:
   ```typescript
   // Tốt: ngắn gọn, mô tả rõ
   const { t, locale, loading } = useTranslate('auth');
   const { t: tCommon } = useTranslate('common');
   const { t: tForm } = useTranslate('form');
   ```

3. **Comment rules**:
   ```typescript
   function LoginForm() {
     // Translation hooks cho form login
     const { t } = useTranslate('auth.login');
     
     const handleSubmit = (data) => {
       // Xử lý submit form với validation messages đa ngôn ngữ
       if (!data.email) {
         setError(t('errors.email.required'));
       }
     };
     
     return (
       <form>
         {/* Email input với label và placeholder đa ngôn ngữ */}
         <input 
           placeholder={t('email.placeholder')} 
           aria-label={t('email.label')} 
         />
       </form>
     );
   }
   ```

## 4. Cấu trúc messages folder sẽ tạo

```
apps/frontend/src/i18n/messages/
├── en/
│   ├── auth.json              # Authentication module
│   ├── user.json              # User dashboard
│   ├── admin.json             # Admin panel
│   ├── artist.json            # Artist management
│   ├── booking.json           # Booking flow
│   ├── community.json         # Community features
│   ├── generalUI.json         # General UI (đã có)
│   ├── sections.json          # Landing sections (đã có)
│   ├── validation.json        # Validation messages
│   └── errors.json            # Error messages
└── vi/
    ├── auth.json              # Authentication module
    ├── user.json              # User dashboard
    ├── admin.json             # Admin panel
    ├── artist.json            # Artist management
    ├── booking.json           # Booking flow
    ├── community.json         # Community features
    ├── generalUI.json         # General UI (đã có)
    ├── sections.json          # Landing sections (đã có)
    ├── validation.json        # Validation messages
    └── errors.json            # Error messages
```

## 5. Sprint-based Implementation Plan

### Sprint 1: Foundation & Auth Module (1-2 ngày)

#### Mục tiêu
- Tạo cấu trúc messages đầy đủ
- Triển khai i18n cho Auth Module
- Cải thiện useTranslate hook (nếu cần)

#### Tasks và thứ tự ưu tiên

1. **Tạo cấu trúc messages folder** (Priority: High)
   - Files: Tất cả file JSON trong cấu trúc trên
   - Dependencies: None

2. **Cải thiện useTranslate hook** (Priority: Medium)
   - File: `src/i18n/hooks/useTranslate.ts`
   - Thêm interpolation support
   - Thêm pluralization support
   - Dependencies: Task 1

3. **Cập nhật LoginForm component** (Priority: High)
   - File: `src/components/auth/login/LoginForm.tsx`
   - Dependencies: Task 1, 2
   - Namespace: `auth.login`

4. **Cập nhật RegisterForm component** (Priority: High)
   - File: `src/components/auth/register/RegisterForm.tsx`
   - Dependencies: Task 1, 2
   - Namespace: `auth.register`

5. **Cập nhật ForgotPasswordForm component** (Priority: High)
   - File: `src/components/auth/forgot-email/ForgotForm.tsx`
   - Dependencies: Task 1, 2
   - Namespace: `auth.forgotPassword`

6. **Cập nhật ResendForm component** (Priority: High)
   - File: `src/components/auth/resend-email/ResendForm.tsx`
   - Dependencies: Task 1, 2
   - Namespace: `auth.resendVerification`

7. **Cập nhật ArtistNavbar component** (Priority: High)
   - File: `src/components/manage-artist/general-components/ArtistNavbar.tsx`
   - Dependencies: Task 1, 2
   - Namespace: `artist.navbar`

#### Checklist verification Sprint 1
- [ ] Cấu trúc messages folder đã được tạo với tất cả file cần thiết
- [ ] useTranslate hook đã được cải thiện với interpolation
- [ ] LoginForm hiển thị đúng ngôn ngữ
- [ ] RegisterForm hiển thị đúng ngôn ngữ
- [ ] ForgotPasswordForm hiển thị đúng ngôn ngữ
- [ ] ResendForm hiển thị đúng ngôn ngữ
- [ ] ArtistNavbar hiển thị đúng ngôn ngữ
- [ ] Language Switcher hoạt động đúng trên tất cả các trang

---

### Sprint 2: User Dashboard (2-3 ngày)

#### Mục tiêu
- Triển khai i18n cho User Profile pages
- Triển khai i18n cho User Booking flow
- Triển khai i18n cho User Layout

#### Tasks và thứ tự ưu tiên

1. **Cập nhật User Profile pages** (Priority: High)
   - Files: 
     - `src/app/user/profile/page.tsx`
     - `src/app/user/profile/my-profile/page.tsx`
     - `src/app/user/profile/edit-profile/page.tsx`
   - Dependencies: Sprint 1 completion
   - Namespace: `user.profile`

2. **Cập nhật Profile components** (Priority: High)
   - Files:
     - `src/components/profile/ProfileLayout.tsx`
     - `src/components/profile/EditProfile.tsx`
     - `src/components/profile/BankAccount.tsx`
     - `src/components/profile/BankAccountModal.tsx`
   - Dependencies: Task 1
   - Namespace: `user.profile`

3. **Cập nhật Booking History** (Priority: High)
   - Files:
     - `src/app/user/profile/booking-history/page.tsx`
     - `src/components/profile/BookingHistory.tsx`
   - Dependencies: Task 1
   - Namespace: `user.booking`

4. **Cập nhật User Layout** (Priority: High)
   - File: `src/app/user/layout.tsx`
   - Dependencies: Tasks 1-3
   - Namespace: `user.layout`

5. **Cập nhật Artists List pages** (Priority: High)
   - Files:
     - `src/app/user/artists/makeup-artist-list/page.tsx`
     - `src/app/user/artists/portfolio/[id]/page.tsx`
   - Dependencies: Sprint 1 completion
   - Namespace: `user.artists`

6. **Cập nhật Artists List components** (Priority: High)
   - Files:
     - `src/components/mua-list/ArtistCard.tsx`
     - `src/components/mua-list/ArtistsList.tsx`
     - `src/components/mua-list/ArtistsListPreview.tsx`
     - `src/components/mua-list/FiltersPanel.tsx`
     - `src/components/mua-list/ResultsPanel.tsx`
   - Dependencies: Task 5
   - Namespace: `user.artists`

7. **Cập nhật Booking pages** (Priority: High)
   - File: `src/app/user/booking/[muaId]/[serviceId]/page.tsx`
   - Dependencies: Sprint 1 completion
   - Namespace: `user.booking`

8. **Cập nhật Booking components** (Priority: High)
   - Files:
     - `src/components/booking/BookingCheckout.tsx`
     - `src/components/booking/BookingLocation.tsx`
     - `src/components/booking/BookingProgress.tsx`
     - `src/components/booking/BookingReview.tsx`
     - `src/components/booking/BookingService.tsx`
     - `src/components/booking/BookingTime.tsx`
   - Dependencies: Task 7
   - Namespace: `user.booking`

#### Checklist verification Sprint 2
- [ ] User Profile pages hiển thị đúng ngôn ngữ
- [ ] Profile components hiển thị đúng ngôn ngữ
- [ ] Booking History hiển thị đúng ngôn ngữ
- [ ] User Layout hoạt động đúng với i18n
- [ ] Artists List pages hiển thị đúng ngôn ngữ
- [ ] Artists List components hiển thị đúng ngôn ngữ
- [ ] Booking pages hiển thị đúng ngôn ngữ
- [ ] Booking components hiển thị đúng ngôn ngữ
- [ ] Navigation trong user dashboard giữ nguyên locale
- [ ] Forms trong user dashboard hiển thị validation messages đúng ngôn ngữ

---

### Sprint 3: Artist Management (2-3 ngày)

#### Mục tiêu
- Triển khai i18n cho Artist dashboard
- Triển khai i18n cho Services management
- Triển khai i18n cho Wallet components

#### Tasks và thứ tự ưu tiên

1. **Cập nhật Artist Dashboard** (Priority: High)
   - File: `src/app/manage-artist/[id]/dashboard/page.tsx`
   - Dependencies: Sprint 2 completion
   - Namespace: `artist.dashboard`

2. **Cập nhật Artist Profile** (Priority: High)
   - File: `src/app/manage-artist/[id]/profile/page.tsx`
   - Dependencies: Task 1
   - Namespace: `artist.profile`

3. **Cập nhật Artist Portfolio** (Priority: High)
   - Files:
     - `src/app/manage-artist/[id]/portfolio/page.tsx`
     - `src/app/manage-artist/portfolio/page.tsx`
   - Dependencies: Task 1
   - Namespace: `artist.portfolio`

4. **Cập nhật Portfolio components** (Priority: High)
   - Files:
     - `src/components/portfolio/PortfolioCard.tsx`
     - `src/components/portfolio/PortfolioFormModal.tsx`
     - `src/components/portfolio/PortfolioManagement.tsx`
     - `src/components/portfolio/DeleteConfirmModal.tsx`
   - Dependencies: Task 3
   - Namespace: `artist.portfolio`

5. **Cập nhật Artist Calendar** (Priority: High)
   - File: `src/app/manage-artist/[id]/calendar/page.tsx`
   - Dependencies: Task 1
   - Namespace: `artist.calendar`

6. **Cập nhật Calendar components** (Priority: High)
   - Files:
     - `src/components/manage-artist/schedule/ArtistCalendar.tsx`
     - `src/components/manage-artist/schedule/components/EventDetailsPopup.tsx`
     - `src/components/manage-artist/schedule/components/EventModal.tsx`
   - Dependencies: Task 5
   - Namespace: `artist.calendar`

7. **Cập nhật Artist Services** (Priority: High)
   - File: `src/app/manage-artist/[id]/services/page.tsx`
   - Dependencies: Task 1
   - Namespace: `artist.services`

8. **Cập nhật Artist Wallet** (Priority: High)
   - File: `src/app/manage-artist/[id]/wallet/page.tsx`
   - Dependencies: Task 1
   - Namespace: `artist.wallet`

9. **Cập nhật Wallet components** (Priority: High)
   - Files:
     - `src/components/manage-artist/wallet/PayoutSection.tsx`
   - Dependencies: Task 8
   - Namespace: `artist.wallet`

10. **Cập nhật Artist Certificates** (Priority: Medium)
    - File: `src/app/manage-artist/[id]/certificates/page.tsx`
    - Dependencies: Task 1
    - Namespace: `artist.certificates`

11. **Cập nhật Certificate components** (Priority: Medium)
    - Files:
      - `src/components/manage-artist/certificate/CertificateCard.tsx`
      - `src/components/manage-artist/certificate/CertificateFormModal.tsx`
      - `src/components/manage-artist/certificate/ManageCertificates.tsx`
    - Dependencies: Task 10
    - Namespace: `artist.certificates`

12. **Cập nhật Artist Feedback** (Priority: Medium)
    - File: `src/app/manage-artist/[id]/feedback/page.tsx`
    - Dependencies: Task 1
    - Namespace: `artist.feedback`

13. **Cập nhật Artist Layout** (Priority: High)
    - File: `src/app/manage-artist/layout.tsx`
    - Dependencies: Tasks 1-12
    - Namespace: `artist.layout`

#### Checklist verification Sprint 3
- [ ] Artist Dashboard hiển thị đúng ngôn ngữ
- [ ] Artist Profile hiển thị đúng ngôn ngữ
- [ ] Artist Portfolio pages hiển thị đúng ngôn ngữ
- [ ] Portfolio components hiển thị đúng ngôn ngữ
- [ ] Artist Calendar hiển thị đúng ngôn ngữ
- [ ] Calendar components hiển thị đúng ngôn ngữ
- [ ] Artist Services hiển thị đúng ngôn ngữ
- [ ] Artist Wallet hiển thị đúng ngôn ngữ
- [ ] Wallet components hiển thị đúng ngôn ngữ
- [ ] Artist Certificates hiển thị đúng ngôn ngữ
- [ ] Certificate components hiển thị đúng ngôn ngữ
- [ ] Artist Feedback hiển thị đúng ngôn ngữ
- [ ] Artist Layout hoạt động đúng với i18n
- [ ] Navigation trong artist dashboard giữ nguyên locale

---

### Sprint 4: Admin & Community (2-3 ngày)

#### Mục tiêu
- Triển khai i18n cho Admin components
- Triển khai i18n cho Community pages
- Triển khai i18n cho các components còn lại

#### Tasks và thứ tự ưu tiên

1. **Cập nhật Admin Dashboard** (Priority: High)
   - Files:
     - `src/app/admin/page.tsx`
     - `src/app/admin/dashboard/page.tsx`
   - Dependencies: Sprint 3 completion
   - Namespace: `admin.dashboard`

2. **Cập nhật Admin Layout** (Priority: High)
   - File: `src/app/admin/layout.tsx`
   - Dependencies: Task 1
   - Namespace: `admin.layout`

3. **Cập nhật Admin components** (Priority: High)
   - Files:
     - `src/components/admin/AdminDashboard.tsx`
     - `src/components/admin/AdminHeader.tsx`
     - `src/components/admin/AdminSidebar.tsx`
   - Dependencies: Task 1
   - Namespace: `admin`

4. **Cập nhật Admin Users Management** (Priority: High)
   - Files:
     - `src/app/admin/users/page.tsx`
     - `src/components/admin/users/UnifiedUserManagement.tsx`
   - Dependencies: Task 1
   - Namespace: `admin.users`

5. **Cập nhật Admin MUAs Management** (Priority: High)
   - Files:
     - `src/app/admin/muas/page.tsx`
     - `src/components/admin/muas/MUAManagement.tsx`
   - Dependencies: Task 1
   - Namespace: `admin.muas`

6. **Cập nhật Admin Transactions** (Priority: Medium)
   - Files:
     - `src/app/admin/transactions/page.tsx`
     - `src/app/admin/transactions/bookings/page.tsx`
     - `src/app/admin/transactions/refunds/page.tsx`
     - `src/app/admin/transactions/withdrawals/page.tsx`
   - Dependencies: Task 1
   - Namespace: `admin.transactions`

7. **Cập nhật Community pages** (Priority: High)
   - Files:
     - `src/app/user/community/page.tsx`
     - `src/app/manage-artist/[id]/community/page.tsx`
   - Dependencies: Sprint 3 completion
   - Namespace: `community`

8. **Cập nhật Community components** (Priority: High)
   - Files:
     - `src/components/community/LeftSidebar.tsx`
     - `src/components/community/MainContent.tsx`
     - `src/components/community/PostCreator.tsx`
     - `src/components/community/PostsFeed.tsx`
     - `src/components/community/RightSidebar.tsx`
     - `src/components/community/SocialWall.tsx`
     - `src/components/community/StoriesSection.tsx`
   - Dependencies: Task 7
   - Namespace: `community`

9. **Cập nhật General UI components** (Priority: Low)
   - Files:
     - `src/components/generalUI/AccessDenied.tsx`
     - `src/components/generalUI/DeleteConfirmDialog.tsx`
     - `src/components/generalUI/ErrorMessage.tsx`
     - `src/components/generalUI/GeneralSkeleton.tsx`
     - `src/components/generalUI/LoadingMessage.tsx`
     - `src/components/generalUI/Notification.tsx`
     - `src/components/generalUI/NotificationDialog.tsx`
     - `src/components/generalUI/PayoutConfirmDialog.tsx`
     - `src/components/generalUI/SuccessMessage.tsx`
   - Dependencies: Sprint 1 completion
   - Namespace: `generalUI`

#### Checklist verification Sprint 4
- [ ] Admin Dashboard hiển thị đúng ngôn ngữ
- [ ] Admin Layout hoạt động đúng với i18n
- [ ] Admin components hiển thị đúng ngôn ngữ
- [ ] Admin Users Management hiển thị đúng ngôn ngữ
- [ ] Admin MUAs Management hiển thị đúng ngôn ngữ
- [ ] Admin Transactions pages hiển thị đúng ngôn ngữ
- [ ] Community pages hiển thị đúng ngôn ngữ
- [ ] Community components hiển thị đúng ngôn ngữ
- [ ] General UI components hiển thị đúng ngôn ngữ
- [ ] Tất cả navigation trong admin panel giữ nguyên locale

---

### Sprint 5: Utilities & Testing (1-2 ngày)

#### Mục tiêu
- Tạo utility functions cho i18n
- Testing và verification toàn bộ hệ thống
- Cập nhật documentation

#### Tasks và thứ tự ưu tiên

1. **Tạo i18n utility functions** (Priority: High)
   - File: `src/utils/i18nUtils.ts`
   - Date formatting theo locale
   - Number formatting theo locale
   - Currency formatting theo locale
   - Dependencies: Sprint 4 completion

2. **Tạo validation messages** (Priority: High)
   - Files:
     - `src/i18n/messages/en/validation.json`
     - `src/i18n/messages/vi/validation.json`
   - Dependencies: Task 1

3. **Tạo error messages** (Priority: High)
   - Files:
     - `src/i18n/messages/en/errors.json`
     - `src/i18n/messages/vi/errors.json`
   - Dependencies: Task 1

4. **Testing trên tất cả các trang** (Priority: High)
   - Test chuyển đổi ngôn ngữ
   - Test navigation với locale
   - Test forms với validation
   - Dependencies: Tasks 1-3

5. **Performance testing** (Priority: Medium)
   - Kiểm tra tốc độ tải trang
   - Kiểm tra memory usage
   - Dependencies: Task 4

6. **Cập nhật documentation** (Priority: Medium)
   - Cập nhật README.md
   - Tạo i18n guidelines document
   - Dependencies: Task 4

#### Checklist verification Sprint 5
- [ ] i18n utility functions đã được tạo
- [ ] Validation messages đã được tạo
- [ ] Error messages đã được tạo
- [ ] Test chuyển đổi ngôn ngữ trên tất cả các trang
- [ ] Test navigation với locale
- [ ] Test forms với validation
- [ ] Performance testing hoàn thành
- [ ] Documentation đã được cập nhật

## 6. Dependencies giữa các Sprint

1. **Sprint 1** là foundation cho tất cả các sprint khác
2. **Sprint 2** phụ thuộc vào Sprint 1 completion
3. **Sprint 3** phụ thuộc vào Sprint 2 completion
4. **Sprint 4** phụ thuộc vào Sprint 3 completion
5. **Sprint 5** phụ thuộc vào Sprint 4 completion

## 7. Tổng checklist hoàn thành

### Foundation
- [ ] Cấu trúc messages folder đã được tạo với tất cả file cần thiết
- [ ] useTranslate hook đã được cải thiện với interpolation
- [ ] LanguageSwitcher component hoạt động đúng

### Auth Module
- [ ] LoginForm đã được cập nhật
- [ ] RegisterForm đã được cập nhật
- [ ] ForgotPasswordForm đã được cập nhật
- [ ] ResendForm đã được cập nhật
- [ ] ArtistNavbar đã được cập nhật

### User Dashboard
- [ ] Profile pages đã được cập nhật
- [ ] Profile components đã được cập nhật
- [ ] Booking History đã được cập nhật
- [ ] User Layout đã được cập nhật
- [ ] Artists list đã được cập nhật
- [ ] Booking flow đã được cập nhật

### Artist Management
- [ ] Artist dashboard đã được cập nhật
- [ ] Services management đã được cập nhật
- [ ] Wallet components đã được cập nhật
- [ ] Portfolio management đã được cập nhật
- [ ] Calendar components đã được cập nhật
- [ ] Artist layout đã được cập nhật

### Admin & Community
- [ ] Admin Dashboard đã được cập nhật
- [ ] Admin components đã được cập nhật
- [ ] Community pages đã được cập nhật
- [ ] Community components đã được cập nhật
- [ ] General UI components đã được cập nhật

### Utilities & Testing
- [ ] i18n utility functions đã được tạo
- [ ] Validation messages đã được tạo
- [ ] Error messages đã được tạo
- [ ] Testing hoàn thành
- [ ] Documentation đã được cập nhật

## 8. Lưu ý quan trọng

### Về hệ thống hiện tại
- Hệ thống i18n hiện tại chỉ hoạt động client-side
- Cần đảm bảo tất cả components sử dụng useTranslate hook
- LanguageSwitcher đã được xây dựng và hoạt động tốt

### Về performance
- Dynamic import đã được implement trong useTranslate hook
- Messages được cache trong state
- Client-side transitions không tải lại messages

### Về testing
- Test trên cả desktop và mobile
- Kiểm tra tất cả các trang với cả 2 ngôn ngữ
- Đảm bảo không có text nào bị bỏ sót
- Test chuyển đổi ngôn ngữ trên các trang khác nhau

### Về deployment
- Không cần thay đổi cấu hình deployment
- Không cần environment variables thêm
- Hệ thống hoạt động hoàn toàn client-side

### Các vấn đề có thể gặp
1. **SSR**: Hệ thống hiện tại không hỗ trợ SSR
2. **SEO**: Cần thêm meta tags đa ngôn ngữ thủ công
3. **Date/Time formatting**: Cần implement utility functions
4. **Number formatting**: Cần implement utility functions

## 9. Ví dụ code mẫu cho từng module

### 9.1 Auth Module

```typescript
// src/components/auth/login/LoginForm.tsx
import { useTranslate } from '@/i18n/hooks/useTranslate';

export default function LoginForm() {
  const { t } = useTranslate('auth.login');
  
  return (
    <form>
      <h2>{t('title')}</h2>
      <label>{t('email.label')}</label>
      <input placeholder={t('email.placeholder')} />
      <label>{t('password.label')}</label>
      <input type="password" placeholder={t('password.placeholder')} />
      <button>{t('submit')}</button>
      <a href="/forgot-password">{t('forgotPassword')}</a>
      <p>{t('noAccount')} <a href="/register">{t('signUp')}</a></p>
    </form>
  );
}
```

```json
// src/i18n/messages/en/auth.json
{
  "login": {
    "title": "Welcome Back!",
    "email": {
      "label": "Email address",
      "placeholder": "example@gmail.com"
    },
    "password": {
      "label": "Password",
      "placeholder": "Enter your password"
    },
    "submit": "Sign In",
    "forgotPassword": "Forgot Password?",
    "noAccount": "Don't have an account?",
    "signUp": "Sign Up"
  }
}
```

```json
// src/i18n/messages/vi/auth.json
{
  "login": {
    "title": "Chào mừng trở lại!",
    "email": {
      "label": "Địa chỉ email",
      "placeholder": "example@gmail.com"
    },
    "password": {
      "label": "Mật khẩu",
      "placeholder": "Nhập mật khẩu của bạn"
    },
    "submit": "Đăng nhập",
    "forgotPassword": "Quên mật khẩu?",
    "noAccount": "Chưa có tài khoản?",
    "signUp": "Đăng ký"
  }
}
```

### 9.2 User Module

```typescript
// src/components/profile/EditProfile.tsx
import { useTranslate } from '@/i18n/hooks/useTranslate';

export default function EditProfile() {
  const { t } = useTranslate('user.profile');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <button>{t('edit')}</button>
      <button>{t('save')}</button>
      <button>{t('cancel')}</button>
    </div>
  );
}
```

```json
// src/i18n/messages/en/user.json
{
  "profile": {
    "title": "My Profile",
    "edit": "Edit",
    "save": "Save",
    "cancel": "Cancel",
    "personalInfo": "Personal Information",
    "contactInfo": "Contact Information"
  }
}
```

```json
// src/i18n/messages/vi/user.json
{
  "profile": {
    "title": "Hồ sơ cá nhân",
    "edit": "Chỉnh sửa",
    "save": "Lưu",
    "cancel": "Hủy",
    "personalInfo": "Thông tin cá nhân",
    "contactInfo": "Thông tin liên hệ"
  }
}
```

### 9.3 Artist Module

```typescript
// src/components/manage-artist/general-components/ArtistNavbar.tsx
import { useTranslate } from '@/i18n/hooks/useTranslate';

export default function ArtistNavbar() {
  const { t } = useTranslate('artist.navbar');
  
  return (
    <nav>
      <ul>
        <li><a href="/dashboard">{t('dashboard')}</a></li>
        <li><a href="/portfolio">{t('portfolio')}</a></li>
        <li><a href="/calendar">{t('calendar')}</a></li>
        <li><a href="/feedback">{t('feedback')}</a></li>
      </ul>
    </nav>
  );
}
```

```json
// src/i18n/messages/en/artist.json
{
  "navbar": {
    "dashboard": "Dashboard",
    "portfolio": "My Portfolio",
    "calendar": "My Calendar",
    "feedback": "My Feedback",
    "community": "Community",
    "about": "About Us"
  }
}
```

```json
// src/i18n/messages/vi/artist.json
{
  "navbar": {
    "dashboard": "Trang quản lý",
    "portfolio": "Portfolio của tôi",
    "calendar": "Lịch của tôi",
    "feedback": "Phản hồi của tôi",
    "community": "Cộng đồng",
    "about": "Về chúng tôi"
  }
}
```

## 10. Kế hoạch triển khai chi tiết

### Phase 1: Preparation (1 ngày)
1. Review và phân tích tất cả components cần i18n
2. Tạo cấu trúc messages folder
3. Chuẩn bị translation keys cho tất cả modules

### Phase 2: Implementation (8-10 ngày)
1. Sprint 1: Foundation & Auth (2 ngày)
2. Sprint 2: User Dashboard (2-3 ngày)
3. Sprint 3: Artist Management (2-3 ngày)
4. Sprint 4: Admin & Community (2-3 ngày)

### Phase 3: Testing & Polish (2-3 ngày)
1. Sprint 5: Utilities & Testing (2-3 ngày)

### Total estimated time: 11-14 ngày

## 11. Success Metrics

### Technical Metrics
- [ ] 100% components sử dụng useTranslate hook
- [ ] 0 hardcode text trong production
- [ ] Performance impact < 5%
- [ ] Memory usage tăng < 10%

### User Experience Metrics
- [ ] Language switching hoạt động mượt mà
- [ ] Không có flicker khi đổi ngôn ngữ
- [ ] Tất cả text được dịch đúng
- [ ] Validation messages hiển thị đúng ngôn ngữ

### Development Metrics
- [ ] Code review pass cho tất cả changes
- [ ] Documentation hoàn chỉnh
- [ ] Test coverage > 80%
- [ ] Không có regression bugs