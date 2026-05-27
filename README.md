# LUNA Makeup Studio - Website đặt lịch dịch vụ makeup

Website đặt lịch và quản trị dịch vụ makeup cho LUNA Makeup Studio. Dự án được xây dựng bằng Next.js App Router, có giao diện khách hàng tiếng Việt, luồng đặt lịch nhiều bước, quản trị nội dung, quản lý lịch hẹn, AI chat tư vấn và lớp tối ưu hiệu năng bằng Redis cache.

## Demo trực tuyến

Website đã được deploy tại:

[Dùng thử website tại đây](https://nguyenthibichtram.online/)

## Mục lục

- [Tính năng chính](#tính-năng-chính)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt nhanh](#cài-đặt-nhanh)
- [Biến môi trường](#biến-môi-trường)
- [Cơ sở dữ liệu](#cơ-sở-dữ-liệu)
- [Redis cache và rate limit](#redis-cache-và-rate-limit)
- [Các lệnh thường dùng](#các-lệnh-thường-dùng)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Tài khoản demo](#tài-khoản-demo)
- [Triển khai production](#triển-khai-production)

## Tính năng chính

### Website khách hàng

- Trang chủ giới thiệu studio, dịch vụ nổi bật, bảng giá, portfolio, đánh giá khách hàng và thông tin liên hệ.
- Danh sách dịch vụ makeup theo danh mục, giá, thời lượng, mô tả, gallery và FAQ.
- Trang chi tiết dịch vụ với metadata SEO động và dữ liệu có cấu trúc JSON-LD.
- Trang portfolio hiển thị ảnh before/after và gallery.
- Blog làm đẹp, trang chi tiết bài viết và sitemap động.
- Form liên hệ và widget liên hệ nổi gồm Zalo, Messenger, gọi điện và AI chat.

### Đặt lịch

- Luồng đặt lịch nhiều bước: chọn dịch vụ, chọn chuyên viên, chọn ngày giờ, nhập thông tin khách hàng và xác nhận.
- Kiểm tra khung giờ trống theo chuyên viên, thời lượng dịch vụ, lịch đã đặt và khung giờ bị chặn.
- Chống đặt trùng lịch.
- Tạo mã đặt lịch tự động.
- Lưu thông tin khách hàng, booking event và analytics event.

### Admin dashboard

- Đăng nhập admin/staff bằng email và mật khẩu.
- Quản lý lịch hẹn, trạng thái lịch, ghi chú nội bộ.
- Quản lý dịch vụ, giá, mô tả, SEO, gallery, benefits, FAQ.
- Quản lý nhân viên, chuyên môn, trạng thái làm việc.
- Quản lý portfolio, blog, đánh giá, khách hàng, AI leads, analytics và cài đặt studio.
- Upload ảnh nội bộ vào `public/uploads`.

### AI chat

- Tư vấn dịch vụ makeup qua backend `/api/ai-chat`, frontend không gọi trực tiếp API AI.
- Trả lời local FAQ trước cho thông tin cố định như giá, địa chỉ, giờ làm việc, SĐT và dịch vụ cơ bản.
- Khi cần AI tư vấn, hệ thống fallback theo thứ tự Groq -> Gemini -> OpenRouter -> câu trả lời dự phòng.
- Giới hạn chủ đề để tập trung vào dịch vụ makeup và đặt lịch.
- Lưu hội thoại, tin nhắn và lead tiềm năng vào database.
- Tự nhận diện số điện thoại trong tin nhắn khách hàng.

### Hiệu năng và bảo vệ hệ thống

- Redis cache cho dữ liệu public đọc nhiều: trang chủ, dịch vụ, blog, portfolio, settings, sitemap, staff và availability.
- Tự fallback về database nếu chưa cấu hình Redis.
- Xóa cache theo tag khi admin thay đổi dữ liệu.
- Rate limit theo IP cho API nhạy cảm như đăng nhập, AI chat, đặt lịch, liên hệ, upload và availability.
- Cache-Control cho API public và static assets.
- Tối ưu ảnh với AVIF/WebP và cache TTL dài cho ảnh tĩnh.

## Công nghệ sử dụng

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma ORM 7
- SQLite cho môi trường development
- Redis cho cache và rate limit production
- Better SQLite3 Prisma adapter
- Groq, Google Gemini và OpenRouter cho AI chat fallback
- Google Gemini SDK qua `@google/genai`
- Framer Motion
- Lucide React
- bcryptjs
- sanitize-html

## Yêu cầu hệ thống

- Node.js 20 LTS hoặc mới hơn
- npm
- Redis, khuyến nghị cho production
- Database production như PostgreSQL, Supabase, Neon hoặc Railway nếu triển khai thật

## Cài đặt nhanh

```bash
npm install
cp .env.example .env
npm run db:push
npm run db:seed
npm run dev
```

Sau khi chạy dev server, mở:

```text
http://localhost:3000
```

Trang admin:

```text
http://localhost:3000/admin/login
```

## Biến môi trường

Tạo file `.env` từ `.env.example` và cập nhật giá trị phù hợp.

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# Auth
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Site
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Redis cache, khuyến nghị cho production
REDIS_URL="redis://localhost:6379"
REDIS_CACHE_PREFIX="beauty-booking"
REDIS_CACHE_DISABLED="false"

# Rate limit
RATE_LIMIT_DISABLED="false"
RATE_LIMIT_MEMORY_MAX_KEYS="10000"

# AI chat providers
# Local FAQ dùng trước. Khi cần AI: Groq -> Gemini -> OpenRouter.
GROQ_API_KEY="your-groq-api-key"
GEMINI_API_KEY="your-gemini-api-key"
OPENROUTER_API_KEY="your-openrouter-api-key"

# Tùy chọn đổi model
# GROQ_MODEL="llama-3.1-8b-instant"
# GEMINI_MODEL="gemini-2.0-flash"
# OPENROUTER_MODEL="meta-llama/llama-3.1-8b-instruct:free"

# Cloudinary, chỉ dùng nếu chuyển upload ảnh sang Cloudinary
# CLOUDINARY_CLOUD_NAME=""
# CLOUDINARY_API_KEY=""
# CLOUDINARY_API_SECRET=""
```

Lưu ý:

- `REDIS_URL` có thể bỏ trống khi chạy local. Khi đó cache và rate limit sẽ fallback về bộ nhớ tiến trình.
- Với production, nên bật Redis thật để cache và rate limit ổn định giữa nhiều instance.
- `NEXTAUTH_SECRET` phải đổi thành chuỗi bí mật mạnh trước khi deploy.
- `NEXT_PUBLIC_SITE_URL` phải trỏ về domain thật để metadata, sitemap và SEO hoạt động đúng.

## Cơ sở dữ liệu

Dự án dùng Prisma với SQLite cho môi trường development.

Schema chính nằm tại:

```text
prisma/schema.prisma
```

File database local mặc định:

```text
prisma/dev.db
```

Đẩy schema vào database:

```bash
npm run db:push
```

Seed dữ liệu mẫu:

```bash
npm run db:seed
```

Reset database local:

```bash
npm run db:reset
```

Khi chuyển sang PostgreSQL cho production, cần cập nhật datasource trong Prisma theo hạ tầng thực tế và chạy migration/db push theo quy trình triển khai của bạn.

## Redis cache và rate limit

Dự án đã có lớp cache dùng Redis tại:

```text
src/lib/cache.ts
src/lib/public-data.ts
src/lib/cache-invalidation.ts
```

Các nhóm dữ liệu được cache:

- Trang chủ
- Danh sách dịch vụ
- Chi tiết dịch vụ
- Danh sách blog và chi tiết blog
- Portfolio
- Settings
- Staff public
- Availability booking
- Sitemap

Khi admin cập nhật nội dung, hệ thống sẽ xóa cache theo tag liên quan để khách truy cập nhận dữ liệu mới.

Rate limit nằm tại:

```text
src/lib/rate-limit.ts
src/proxy.ts
```

Các giới hạn mặc định:

| Endpoint | Giới hạn |
| --- | --- |
| `/api/admin/auth/login` | 5 lần/phút |
| `/api/ai-chat` | 12 lần/phút và 80 lần/giờ |
| `/api/contact` | 8 lần/10 phút |
| `/api/bookings` | 6 lần/10 phút |
| `/api/availability` | 90 lần/phút |
| `/api/admin/upload` | 20 lần/10 phút |
| `/api/services`, `/api/staff` | 180 lần/phút |
| Toàn bộ `/api/*` ở proxy | giới hạn thô theo IP |
| Toàn bộ `/admin/*` ở proxy | giới hạn thô theo IP |

Rate limit ở tầng ứng dụng giúp giảm spam và bảo vệ database/API quota. Với DDoS lớn, vẫn nên dùng thêm Cloudflare, Vercel Firewall hoặc WAF/CDN tương đương.

## Các lệnh thường dùng

```bash
npm run dev
```

Chạy server development.

```bash
npm run build
```

Build production.

```bash
npm run start
```

Chạy bản production sau khi build.

```bash
npm run lint
```

Kiểm tra lint.

```bash
npm run db:push
```

Đồng bộ Prisma schema với database.

```bash
npm run db:seed
```

Tạo dữ liệu mẫu.

```bash
npm run db:reset
```

Reset database local và seed lại dữ liệu.

## Cấu trúc thư mục

```text
.
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── dev.db
├── public/
│   ├── images/
│   └── uploads/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   ├── admin/
│   │   ├── api/
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── robots.ts
│   │   └── sitemap.ts
│   ├── components/
│   │   ├── admin/
│   │   ├── contact-widget/
│   │   ├── public/
│   │   └── ui/
│   ├── lib/
│   │   ├── cache.ts
│   │   ├── cache-invalidation.ts
│   │   ├── prisma.ts
│   │   ├── public-data.ts
│   │   ├── rate-limit.ts
│   │   └── utils.ts
│   └── proxy.ts
├── next.config.ts
├── prisma.config.ts
├── package.json
└── README.md
```

## Tài khoản demo

Sau khi chạy seed, có thể đăng nhập admin bằng:

```text
Email: admin@glamora.vn
Mật khẩu: Admin@123456
```

Tài khoản staff:

```text
Email: linh@glamora.vn
Mật khẩu: Admin@123456
```

Nên đổi toàn bộ mật khẩu mặc định trước khi deploy production.

## Triển khai production

Khuyến nghị triển khai trên Vercel hoặc một nền tảng hỗ trợ Next.js App Router.

Checklist production:

- Cấu hình `NEXT_PUBLIC_SITE_URL` bằng domain thật.
- Đổi `NEXTAUTH_SECRET`.
- Dùng database production, khuyến nghị PostgreSQL.
- Cấu hình `REDIS_URL` bằng Redis production.
- Cấu hình `GROQ_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY` để AI chat có nhiều provider fallback.
- Kiểm tra quyền ghi file nếu dùng upload local. Với serverless, nên chuyển upload ảnh sang dịch vụ lưu trữ như Cloudinary hoặc S3.
- Bật CDN/WAF như Cloudflare hoặc Vercel Firewall để chống DDoS ở tầng mạng.
- Chạy `npm run build` trước khi deploy.

## Ghi chú bảo trì

- Dữ liệu public nên đi qua các helper trong `src/lib/public-data.ts` để tận dụng Redis cache.
- Khi thêm API mới có ghi database hoặc gọi dịch vụ bên ngoài, nên thêm `rateLimit`.
- Khi thêm admin mutation mới, cần gọi invalidation tương ứng để cache public được làm mới.
- Không commit file `.env`.
- Không dùng tài khoản demo trong production.
