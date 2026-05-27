import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";

const adapter = new PrismaBetterSqlite3({
  url: `file:${path.join(__dirname, "dev.db")}`,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Bắt đầu tạo dữ liệu mẫu (Seeding database)...");

  const hashedPassword = await bcrypt.hash("Admin@123456", 12);

  // 1. Khởi tạo Users & Staff Profiles
  console.log("👤 Đang tạo Users...");
  
  await prisma.user.upsert({
    where: { email: "admin@glamora.vn" },
    update: {},
    create: {
      email: "admin@glamora.vn",
      password: hashedPassword,
      name: "Admin Glamora",
      role: "ADMIN",
      status: "ACTIVE",
      avatar: null,
    },
  });

  await prisma.user.upsert({
    where: { email: "linh@glamora.vn" },
    update: {},
    create: {
      email: "linh@glamora.vn",
      password: hashedPassword,
      name: "Linh Makeup Artist",
      role: "STAFF",
      status: "ACTIVE",
      avatar: null,
      staffProfile: {
        create: {
          displayName: "Linh Makeup Artist",
          bio: "Chuyên gia makeup với 5 năm kinh nghiệm, đặc biệt giỏi makeup cô dâu và tone Hàn Quốc.",
          experienceYears: 5,
          specialties: JSON.stringify(["Makeup cô dâu", "Tone Hàn Quốc", "Makeup dự tiệc"]),
          workingStatus: "ACTIVE",
          workingHours: JSON.stringify({ start: "08:00", end: "21:00", daysOff: [0] }),
          sortOrder: 1,
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: "khanh@glamora.vn" },
    update: {},
    create: {
      email: "khanh@glamora.vn",
      password: hashedPassword,
      name: "Khánh Beauty Stylist",
      role: "STAFF",
      status: "ACTIVE",
      avatar: null,
      staffProfile: {
        create: {
          displayName: "Khánh Beauty Stylist",
          bio: "Stylist chuyên nghiệp với phong cách hiện đại, cá tính. Thành thạo makeup dự tiệc và sự kiện.",
          experienceYears: 3,
          specialties: JSON.stringify(["Makeup dự tiệc", "Makeup sự kiện", "Làm tóc"]),
          workingStatus: "ACTIVE",
          workingHours: JSON.stringify({ start: "08:00", end: "21:00", daysOff: [0] }),
          sortOrder: 2,
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: "mai@glamora.vn" },
    update: {},
    create: {
      email: "mai@glamora.vn",
      password: hashedPassword,
      name: "Mai Bridal Makeup",
      role: "STAFF",
      status: "ACTIVE",
      avatar: null,
      staffProfile: {
        create: {
          displayName: "Mai Bridal Makeup",
          bio: "Chuyên gia makeup cô dâu hàng đầu, nổi bật với tone Tây sang trọng và quý phái.",
          experienceYears: 7,
          specialties: JSON.stringify(["Makeup cô dâu", "Tone Tây", "Chụp ảnh cưới"]),
          workingStatus: "ACTIVE",
          workingHours: JSON.stringify({ start: "08:00", end: "21:00", daysOff: [0] }),
          sortOrder: 3,
        },
      },
    },
  });

  const profiles = await prisma.staffProfile.findMany();

  // 2. Khởi tạo Services
  console.log("💄 Đang tạo Services...");
  
  const services = [
    {
      name: "Makeup cô dâu cao cấp",
      slug: "makeup-co-dau",
      category: "Cô dâu",
      shortDescription: "Lớp makeup lộng lẫy, giữ tone siêu bền cho ngày trọng đại nhất của bạn.",
      description: "Dịch vụ makeup cô dâu cao cấp tại LUNA Makeup Studio cam kết mang lại vẻ đẹp hoàn mỹ nhất cho bạn trong ngày cưới.",
      basePrice: 1500000,
      durationMin: 180,
      thumbnail: "/uploads/bridal_makeup.png",
      gallery: JSON.stringify(["/uploads/bridal_makeup.png", "/images/bridal.png"]),
      benefits: JSON.stringify(["Tư vấn tone makeup hợp khuôn mặt", "Thử makeup miễn phí 1 lần", "Sử dụng 100% mỹ phẩm High-end", "Hỗ trợ phụ kiện cài tóc cao cấp"]),
      occasions: JSON.stringify(["Lễ rước dâu", "Tiệc cưới nhà hàng", "Lễ đính hôn (Đám hỏi)", "Chụp ảnh Pre-wedding"]),
      faq: JSON.stringify([
        { question: "Thời gian makeup mất bao lâu?", answer: "Thông thường makeup và làm tóc cô dâu sẽ mất khoảng 2.5 đến 3 tiếng." },
        { question: "Mình có cần chuẩn bị gì trước không?", answer: "Bạn chỉ cần gội đầu sạch, đắp mặt nạ dưỡng ẩm vào tối hôm trước và mặc áo có nút cài phía trước để dễ thay đồ nhé." },
      ]),
      featured: true,
      sortOrder: 1,
      status: "ACTIVE",
    },
    {
      name: "Makeup đi tiệc & Sự kiện",
      slug: "makeup-du-tiec",
      category: "Dự tiệc",
      shortDescription: "Tỏa sáng nổi bật tại mọi bữa tiệc, sinh nhật, prom hay event công ty.",
      description: "Dù là tiệc ban ngày nhẹ nhàng hay tiệc tối lộng lẫy, LUNA sẽ giúp bạn biến hóa hoàn hảo.",
      basePrice: 450000,
      durationMin: 90,
      thumbnail: "/uploads/party_makeup.png",
      gallery: JSON.stringify(["/uploads/party_makeup.png", "/images/hero.png"]),
      benefits: JSON.stringify(["Lớp nền mỏng nhẹ, tự nhiên", "Bền màu 8-12 tiếng", "Tặng kèm mi giả và kích mí", "Bao gồm làm tóc đơn giản"]),
      occasions: JSON.stringify(["Tiệc sinh nhật", "Prom / Dạ hội", "Sự kiện công ty", "Đi bar / Clubbing"]),
      featured: true,
      sortOrder: 2,
      status: "ACTIVE",
    },
    {
      name: "Makeup kỷ yếu / Tốt nghiệp",
      slug: "makeup-ky-yeu",
      category: "Kỷ yếu",
      shortDescription: "Lưu giữ thanh xuân rực rỡ với layout makeup trong trẻo, tươi tắn.",
      description: "Gói makeup dành riêng cho các bạn học sinh, sinh viên chuẩn bị chụp ảnh kỷ yếu. Phong cách chủ đạo là tone Hàn Quốc.",
      basePrice: 350000,
      durationMin: 75,
      thumbnail: "/uploads/natural_makeup.png",
      gallery: JSON.stringify(["/uploads/natural_makeup.png"]),
      benefits: JSON.stringify(["Giảm 10% cho nhóm từ 3 người", "Giảm 20% cho nhóm từ 5 người", "Hỗ trợ dặm phấn tại điểm chụp (có phí)"]),
      occasions: JSON.stringify(["Chụp kỷ yếu cấp 3", "Lễ tốt nghiệp Đại học", "Chụp thanh xuân"]),
      featured: true,
      sortOrder: 3,
      status: "ACTIVE",
    },
    {
      name: "Làm tóc nghệ thuật",
      slug: "lam-toc-du-tiec",
      category: "Làm tóc",
      shortDescription: "Tạo kiểu tóc chuyên nghiệp, uốn, bới, tết tóc nghệ thuật.",
      description: "Dịch vụ dành cho những khách hàng đã tự makeup nhưng cần một mái tóc được thiết kế chỉn chu để hoàn thiện vẻ ngoài.",
      basePrice: 250000,
      durationMin: 45,
      thumbnail: "/images/hero.png",
      gallery: JSON.stringify([]),
      featured: false,
      sortOrder: 4,
      status: "ACTIVE",
    },
  ];

  for (const svc of services) {
    await prisma.service.upsert({
      where: { slug: svc.slug },
      update: svc,
      create: svc,
    });
  }

  const allServices = await prisma.service.findMany();
  for (const svc of allServices) {
    for (const profile of profiles) {
      await prisma.serviceStaff.upsert({
        where: { serviceId_staffId: { serviceId: svc.id, staffId: profile.id } },
        update: {},
        create: { serviceId: svc.id, staffId: profile.id },
      });
    }
  }

  // 3. Khởi tạo Blog Posts
  console.log("📝 Đang tạo Blogs...");
  
  const blogs = [
    {
      title: "Xu Hướng Makeup Cô Dâu Tone Tây Đình Đám Năm 2024",
      slug: "xu-huong-makeup-co-dau-tone-tay-2024",
      excerpt: "Tone Tây đang dần chiếm lĩnh xu hướng makeup cưới năm nay. Cùng LUNA khám phá cách biến hóa để trở thành cô dâu quyến rũ, sắc sảo nhưng không kém phần sang trọng.",
      content: `# Xu Hướng Makeup Cô Dâu Tone Tây Đình Đám Năm 2024\n\nNếu như tone Hàn Quốc mang lại vẻ đẹp trong trẻo, mỏng manh thì **Tone Tây** lại là tuyên ngôn của sự quyến rũ, cá tính và vô cùng cuốn hút.\n\n![Tone Tây Sang Trọng](/uploads/party_makeup.png)\n\n## 1. Lớp nền (Foundation)\nKhác với nền sương sương của Hàn, makeup tone Tây chú trọng vào lớp nền lì (matte) hoặc bán lì (semi-matte), che phủ hoàn hảo nhưng vẫn có độ tệp vào da. Đặc biệt, nghệ thuật **Contour (tạo khối)** và **Highlight (bắt sáng)** được áp dụng triệt để nhằm tôn lên các góc cạnh của khuôn mặt.\n\n## 2. Đôi mắt hút hồn\nĐiểm nhấn lớn nhất của phong cách này chính là đôi mắt. Mắt thường được nhấn sâu bằng kỹ thuật *Cut Crease* hoặc *Smokey Eyes* với các tone màu trầm ấm như nâu đất, đồng, cam cháy. Đi kèm là hàng mi giả cong vút và đường eyeliner sắc lẹm.\n\n## 3. Đôi môi tều quyến rũ\nMôi thường được vẽ ăn gian viền để tạo độ dày, căng mọng (plump lips). Các màu son cực kỳ được ưa chuộng là màu nude, cam đất, hồng đất hoặc đỏ rượu.\n\n> **Lưu ý:** Makeup tone Tây đòi hỏi kỹ thuật cao từ chuyên viên để tránh làm khuôn mặt bị già dặn. Tại LUNA Makeup Studio, chúng tôi tự hào có những Master chuyên xử lý tone Tây đỉnh cao!\n\n**Liên hệ ngay LUNA để được tư vấn layout cưới phù hợp nhất!**`,
      thumbnail: "/uploads/party_makeup.png",
      category: "Xu Hướng",
      seoTitle: "Xu hướng Makeup Cô Dâu Tone Tây 2024 | LUNA Makeup",
      seoDescription: "Khám phá xu hướng makeup cô dâu tone Tây quyến rũ, sang trọng 2024. Tư vấn layout cưới hoàn hảo tại LUNA Makeup Studio.",
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
    {
      title: "Cách Chăm Sóc Da Trị Giá 'Triệu Đô' Trước Ngày Cưới",
      slug: "cach-cham-soc-da-truoc-ngay-cuoi",
      excerpt: "Một lớp makeup đẹp bắt nguồn từ một làn da khỏe. Hãy áp dụng ngay quy trình skincare 30 ngày đếm ngược này để da căng bóng rạng rỡ.",
      content: `# Cách Chăm Sóc Da Trị Giá 'Triệu Đô' Trước Ngày Cưới\n\nNhiều cô dâu quá bận rộn lo việc cưới xin mà bỏ quên làn da của mình. Đến ngày cưới, da khô mốc khiến lớp makeup không thể tệp vào da (cakey). Dưới đây là quy trình cứu nguy cho làn da của bạn.\n\n## 1 Tháng Trước Ngày Cưới\n- **Không thử mỹ phẩm mới:** Đây không phải lúc để làm chuột bạch. Hãy dùng những sản phẩm bạn đã quen thuộc để tránh kích ứng.\n- **Tẩy tế bào chết định kỳ:** 1-2 lần/tuần để loại bỏ lớp sừng già cỗi.\n- **Dưỡng ẩm sâu:** Sử dụng serum HA và kem dưỡng ẩm phục hồi.\n\n## 1 Tuần Trước Ngày Cưới\n- Tăng cường đắp mặt nạ giấy (Sheet mask) xen kẽ các ngày.\n- Uống đủ 2-3 lít nước mỗi ngày và ăn nhiều trái cây.\n- Ngủ trước 11h đêm để tránh quầng thâm mắt.\n\n## Tối Hôm Trước Lễ Cưới\n- Rửa mặt sạch sẽ.\n- Đắp mặt nạ cấp tốc.\n- Thoa kem dưỡng mắt.\n- Đi ngủ với tinh thần thật thoải mái!\n\nLUNA Makeup Studio chúc bạn có một ngày cưới thật lộng lẫy và hạnh phúc!`,
      thumbnail: "/uploads/natural_makeup.png",
      category: "Chăm Sóc Da",
      status: "PUBLISHED",
      publishedAt: new Date(),
    }
  ];

  for (const blog of blogs) {
    await prisma.blogPost.upsert({
      where: { slug: blog.slug },
      update: blog,
      create: blog,
    });
  }

  // 4. Khởi tạo Portfolio
  console.log("📸 Đang tạo Portfolio...");
  const portfolioItems = [
    { 
      title: "Cô Dâu Ánh Kim Tuyết", 
      slug: "co-dau-anh-kim-tuyet", 
      style: "Tone Tây", 
      description: "Layout cô dâu tone Tây sang trọng, điểm nhấn vào đôi mắt sâu và nhũ lấp lánh.", 
      afterImage: "/uploads/bridal_makeup.png",
      gallery: JSON.stringify(["/uploads/bridal_makeup.png"]),
      status: "VISIBLE", 
      sortOrder: 1 
    },
    { 
      title: "Nàng Thơ Thanh Xuân", 
      slug: "nang-tho-thanh-xuan", 
      style: "Tone Hàn Quốc", 
      description: "Trang điểm nhẹ nhàng, lớp nền căng bóng như sương mai.", 
      afterImage: "/uploads/natural_makeup.png",
      status: "VISIBLE", 
      sortOrder: 2 
    },
    { 
      title: "Dạ Hội Quyến Rũ", 
      slug: "da-hoi-quyen-ru", 
      style: "Dự tiệc", 
      description: "Makeup đi tiệc buổi tối với màu son đỏ quyền lực và đường kẻ mắt sắc lẹm.", 
      afterImage: "/uploads/party_makeup.png",
      status: "VISIBLE", 
      sortOrder: 3 
    },
    { 
      title: "Kỷ Yếu Vintage", 
      slug: "ky-yeu-vintage", 
      style: "Kỷ yếu", 
      description: "Phong cách retro/vintage đang rất hot cho mùa chụp kỷ yếu năm nay.", 
      afterImage: "/images/bridal.png",
      status: "VISIBLE", 
      sortOrder: 4 
    },
  ];

  for (const item of portfolioItems) {
    await prisma.portfolioItem.upsert({
      where: { slug: item.slug },
      update: item,
      create: item,
    });
  }

  // 5. Khởi tạo Đánh giá (Reviews)
  console.log("⭐ Đang tạo Reviews...");
  const reviews = [
    { name: "Thúy Vi", rating: 5, comment: "Cảm ơn LUNA đã biến em thành cô dâu xinh đẹp nhất! Tone makeup giữ tới tận tối mịt lúc tàn tiệc vẫn không hề bị mốc nền. Chị makeup siêu có tâm luôn.", service: "Makeup cô dâu cao cấp", avatar: null },
    { name: "Hà My", rating: 5, comment: "Đi ăn cưới bạn mà bị khen xinh lấn át cả nhân vật chính =))) Makeup mỏng nhẹ mà cực kỳ bắt sáng, làm tóc cũng ưng lắm ạ.", service: "Makeup đi tiệc & Sự kiện", avatar: null },
    { name: "Bảo Trân", rating: 5, comment: "Nhóm kỷ yếu tụi em 10 đứa làm bên studio, giá hạt dẻ mà mấy chị làm việc cực kỳ nhiệt tình, vui vẻ, ảnh ra lung linh xuất sắc.", service: "Makeup kỷ yếu / Tốt nghiệp", avatar: null },
    { name: "Lan Anh", rating: 4, comment: "Chuyên viên trang điểm tay nghề rất tốt, đúng phong cách tone Tây mình yêu thích. Tuy nhiên cuối tuần studio hơi đông nên phải đợi làm tóc một chút xíu.", service: "Makeup đi tiệc & Sự kiện", avatar: null },
    { name: "Hồng Nhung", rating: 5, comment: "Lần thứ 3 book LUNA và chưa bao giờ thất vọng. Mỹ phẩm chính hãng, chổi cọ luôn sạch sẽ, làm việc rất chuyên nghiệp.", service: "Makeup đi tiệc & Sự kiện", avatar: null },
  ];

  await prisma.review.deleteMany();
  for (const review of reviews) {
    await prisma.review.create({ data: review });
  }

  // 6. Khởi tạo Settings
  console.log("⚙️ Đang cấu hình Settings...");
  const settings: Record<string, string> = {
    studio_name: "LUNA Makeup Studio",
    phone: "0393231806",
    address: "123 Lê Lợi, Phường Chánh Lộ, TP. Quảng Ngãi",
    zalo_phone: "0393231806",
    zalo_url: "https://zalo.me/0393231806",
    messenger_url: "https://m.me/lunamakeup",
    facebook_url: "https://facebook.com/lunamakeup",
    tiktok_url: "https://tiktok.com/@lunamakeup",
    website_url: "https://lunamakeup.vn",
    google_map_embed_url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3835.8561!2d108.7927!3d15.1201!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTXCsDA3JzEyLjQiTiAxMDjCsDQ3JzMzLjciRQ!5e0!3m2!1svi!2s!4v1",
    google_map_direction_url: "https://www.google.com/maps/dir/?api=1&destination=15.1201,108.7927",
    opening_hours: JSON.stringify({ weekdays: "08:00 - 21:00", saturday: "08:00 - 21:00", sunday: "09:00 - 18:00" }),
    area_served: "Quảng Ngãi, Quảng Nam, Đà Nẵng",
    booking_policy: "Quý khách vui lòng đặt lịch trước ít nhất 24 giờ. Đặc biệt với lịch makeup cô dâu, vui lòng book trước từ 1-3 tháng để đảm bảo giữ được lịch ưng ý.",
    deposit_policy: "Studio yêu cầu chuyển khoản cọc 30% đối với các dịch vụ cô dâu và sự kiện lớn để giữ lịch chắc chắn.",
    cancellation_policy: "Báo hủy/đổi lịch trước 48h để được bảo lưu tiền cọc. Hủy sau thời gian này sẽ mất cọc ạ.",
    default_seo_title: "LUNA Makeup Studio | Trang Điểm Cá Nhân & Cô Dâu Chuyên Nghiệp",
    default_seo_description: "LUNA Makeup Studio chuyên cung cấp dịch vụ trang điểm cô dâu, dự tiệc, kỷ yếu chuẩn xu hướng mới nhất tại Quảng Ngãi. Đội ngũ chuyên viên giàu kinh nghiệm, mỹ phẩm cao cấp.",
  };

  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  console.log("✅ Seed dữ liệu thành công! Trang web đã sẵn sàng với hình ảnh và nội dung siêu đẹp.");
}

main()
  .catch((e) => {
    console.error("Lỗi khi chạy Seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
