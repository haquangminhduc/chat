// Chinese Learning Roadmaps & Curriculum Data

export const chineseRoadmap = {
  id: 'zh',
  title: 'Lộ Trình Tiếng Trung Toàn Diện',
  description: 'Từ Pinyin nhập môn, HSK 1-6 đến Tiếng Trung Thương Mại & Nhập Hàng',
  stages: [
    {
      id: 'zh-stage-1',
      number: 1,
      title: 'Chặng 1: Nhập Môn Pinyin & Chữ Hán Cơ Bản (HSK 1-2)',
      description: 'Làm chủ 4 thanh điệu, ghép vần Pinyin, nét chữ Hán và giao tiếp hàng ngày.',
      badge: '🏮 Nhập môn',
      color: 'from-red-500 to-rose-700',
      lessons: [
        {
          id: 'zh-1-1',
          title: 'Bài 1: Bảng Chữ Cái Pinyin & 4 Thanh Điệu',
          type: 'theory',
          duration: '15 phút',
          xp: 50,
          summary: 'Học cách phát âm chuẩn 4 thanh điệu (mā, má, mǎ, mà) và thanh nhẹ.',
          content: {
            theory: `### 1. Cấu trúc Pinyin (Phiên Âm Tiếng Trung)
Một âm tiết Pinyin gồm **Thanh mẫu** (Phụ âm đầu) + **Vận mẫu** (Vần) + **Thanh điệu**.

#### 🔊 4 Thanh Điệu Cốt Lõi:
- **Thanh 1 (mā):** Âm cao, ngang, kéo dài (5-5). Ví dụ: *妈* (Mẹ).
- **Thanh 2 (má):** Âm từ trung bình lên cao, như dấu sắc tiếng Việt (3-5). Ví dụ: *麻* (Cây gai/Tê).
- **Thanh 3 (mǎ):** Âm xuống thấp rồi lên cao, gần giống dấu hỏi (2-1-4). Ví dụ: *马* (Con ngựa).
- **Thanh 4 (mà):** Âm dứt khoát, đi từ cao xuống thấp (5-1). Ví dụ: *骂* (Mắng).

#### 💡 Quy tắc biến điệu quan trọng:
Khi hai thanh 3 đi liền nhau (ví dụ: *Nǐ hǎo* - 你好), thanh 3 thứ nhất đọc thành **thanh 2** (*Ní hǎo*).`,
            quiz: [
              {
                question: 'Từ "你好" (Nǐ hǎo) đọc biến điệu chuẩn là gì?',
                options: ['Nǐ hǎo', 'Ní hǎo', 'Nì hǎo', 'Nī hǎo'],
                correct: 1,
                explanation: 'Hai thanh 3 đi liền nhau thì từ đầu tiên đổi thành thanh 2 (Ní hǎo).'
              },
              {
                question: 'Từ "mā" mang thanh điệu mấy?',
                options: ['Thanh 1', 'Thanh 2', 'Thanh 3', 'Thanh 4'],
                correct: 0,
                explanation: '"mā" có nét ngang trên đầu đại diện cho Thanh 1 (âm ngang cao).'
              }
            ]
          }
        },
        {
          id: 'zh-1-2',
          title: 'Bài 2: Chào Hỏi & Mẫu Câu Xã Giao Hàng Ngày',
          type: 'theory',
          duration: '20 phút',
          xp: 60,
          summary: 'Nắm vững các câu chào hỏi, cảm ơn, xin lỗi và xưng hô.',
          content: {
            theory: `### 1. Mẫu câu chào hỏi thông dụng
- **你好 (Nǐ hǎo):** Xin chào!
- **您好 (Nín hǎo):** Xin chào (kính trọng người lớn tuổi/cấp trên).
- **谢谢 (Xièxie):** Cảm ơn! -> **不客气 (Bú kèqi):** Không có gì.
- **对不起 (Duìbuqǐ):** Xin lỗi -> **没关系 (Méi guānxi):** Không sao đâu.
- **再见 (Zàijiàn):** Tạm biệt.`,
            quiz: [
              {
                question: 'Khi ai đó nói "谢谢" (Xièxie), bạn nên đáp lại là gì?',
                options: ['对不起', '不客气', '再见', '你好'],
                correct: 1,
                explanation: '"不客气" (Bú kèqi) nghĩa là Không có gì / Đừng khách khí.'
              }
            ]
          }
        },
        {
          id: 'zh-1-3',
          title: 'Bài 3: Roleplay - Chào Hỏi & Kết Bạn Với Người Bản Xứ',
          type: 'roleplay',
          duration: '25 phút',
          xp: 80,
          summary: 'Hội thoại nhập vai làm quen bạn mới bằng tiếng Trung.',
          scenarioId: 'zh-greeting'
        }
      ]
    },
    {
      id: 'zh-stage-2',
      number: 2,
      title: 'Chặng 2: Tiếng Trung Mua Sắm & Nhập Hàng (Taobao/1688)',
      description: 'Học từ vựng, mẫu câu hỏi giá, trả giá, mặc cả và làm việc với shop Trung Quốc.',
      badge: '📦 Nhập hàng & Săn Sale',
      color: 'from-amber-500 to-orange-700',
      lessons: [
        {
          id: 'zh-2-1',
          title: 'Bài 1: Từ Vựng Mua Sắm, Hỏi Giá & Trả Giá Chuyên Nghiệp',
          type: 'theory',
          duration: '20 phút',
          xp: 75,
          summary: 'Các thuật ngữ mua sắm online, hỏi phí ship, giảm giá trên Shopee/Taobao.',
          content: {
            theory: `### 1. Từ vựng Mua sắm & Săn Sale Cốt Lõi
- **多少钱 (Duōshao qián?):** Bao nhiêu tiền?
- **便宜一点 (Piányi yīdiǎn):** Rẻ hơn một chút đi!
- **包邮 (Bāoyóu):** Miễn phí vận chuyển (Freeship).
- **优惠券 (Yōuhuìquàn):** Mã giảm giá / Voucher.
- **有货吗 (Yǒu huò ma?):** Còn hàng không?
- **发货 (Fāhuò):** Giao hàng / Phát hàng.

### 2. Mẫu câu chat đàm phán với Chủ Shop:
- *"老板，这个多少钱？能便宜一点吗？"* (Ông chủ, cái này bao nhiêu tiền? Có rẻ hơn chút được không?)
- *"买多有折扣吗？发货快不快？"* (Mua nhiều có giảm giá không? Giao hàng có nhanh không?)`,
            quiz: [
              {
                question: 'Thuật ngữ "包邮" (Bāoyóu) khi mua hàng online nghĩa là gì?',
                options: ['Hàng có sẵn', 'Freeship (Miễn phí vận chuyển)', 'Đã hết hàng', 'Cần cọc tiền'],
                correct: 1,
                explanation: '"包邮" có nghĩa là Bao ship / Freeship.'
              }
            ]
          }
        },
        {
          id: 'zh-2-2',
          title: 'Bài 2: Roleplay - Đàm Phán Giá & Nhập Hàng Với Chủ Shop Taobao/1688',
          type: 'roleplay',
          duration: '25 phút',
          xp: 90,
          summary: 'Thực hành chat đàm phán giá sỉ và xin freeship với AI đóng vai chủ xưởng Trung Quốc.',
          scenarioId: 'zh-shopping'
        }
      ]
    },
    {
      id: 'zh-stage-3',
      number: 3,
      title: 'Chặng 3: Tiếng Trung Giao Tiếp Nâng Cao (HSK 4-6)',
      description: 'Luyện giao tiếp thành thạo, đọc báo chí và làm việc trong doanh nghiệp Trung Quốc.',
      badge: '💼 Giao thương',
      color: 'from-emerald-600 to-green-800',
      lessons: [
        {
          id: 'zh-3-1',
          title: 'Bài 1: Roleplay - Đàm Phán Hợp Đồng Thương Mại & Đối Tác',
          type: 'roleplay',
          duration: '30 phút',
          xp: 100,
          summary: 'Đàm phán hợp đồng sản xuất và thanh toán với giám đốc nhà máy AI.',
          scenarioId: 'zh-business'
        }
      ]
    }
  ]
};
