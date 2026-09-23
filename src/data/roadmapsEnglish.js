// English Learning Roadmaps & Curriculum Data

export const englishRoadmap = {
  id: 'en',
  title: 'Lộ Trình Tiếng Anh Toàn Diện',
  description: 'Từ mất gốc đến giao tiếp tự tin và làm việc chuyên nghiệp',
  stages: [
    {
      id: 'en-stage-1',
      number: 1,
      title: 'Chặng 1: Nền Tảng & Ngữ Âm IPA (A1)',
      description: 'Làm chủ 44 âm IPA, cấu trúc ngữ pháp căn bản và 500 từ vựng cốt lõi.',
      badge: '🌱 Nhập môn',
      color: 'from-emerald-500 to-teal-700',
      lessons: [
        {
          id: 'en-1-1',
          title: 'Bài 1: Bảng Ngữ Âm IPA & Phát Âm Chuẩn',
          type: 'theory',
          duration: '15 phút',
          xp: 50,
          summary: 'Nắm vững nguyên âm đơn, nguyên âm đôi và phụ âm trong tiếng Anh.',
          content: {
            theory: `### 1. Giới thiệu Bảng Ngữ Âm IPA
Bảng ký tự ngữ âm quốc tế (IPA) gồm **44 âm cơ bản**: 20 nguyên âm (Vowels) và 24 phụ âm (Consonants).

#### 🔊 Nguyên Âm Ngắn & Nguyên Âm Dài:
- **/iː/ (Dài):** Môi mở rộng sang hai bên như đang cười. Ví dụ: *see* /siː/, *eat* /iːt/.
- **/ɪ/ (Ngắn):** Phát âm ngắn, thả lỏng môi. Ví dụ: *sit* /sɪt/, *bit* /bɪt/.
- **/uː/ (Dài):** Tròn môi, kéo dài. Ví dụ: *too* /tuː/, *food* /fuːd/.
- **/ʊ/ (Ngắn):** Môi hơi tròn, phát âm nhanh. Ví dụ: *put* /pʊt/, *good* /ɡʊd/.

#### 💡 Mẹo phát âm:
Luôn nhìn phiên âm IPA trong từ điển thay vì đoán cách đọc qua mặt chữ!`,
            quiz: [
              {
                question: 'Từ "seat" phát âm với nguyên âm nào?',
                options: ['/ɪ/ (ngắn)', '/iː/ (dài)', '/e/', '/æ/'],
                correct: 1,
                explanation: '"seat" chứa âm /iː/ kéo dài (/siːt/).'
              },
              {
                question: 'IPA giúp ích gì nhất cho người học tiếng Anh?',
                options: ['Viết đúng chính tả', 'Phát âm chuẩn bất kỳ từ nào không cần đoán', 'Tăng tốc độ đọc', 'Tất cả các đáp án trên'],
                correct: 1,
                explanation: 'IPA là chìa khoá để phát âm chính xác bất kỳ từ nào.'
              }
            ]
          }
        },
        {
          id: 'en-1-2',
          title: 'Bài 2: Thì Hiện Tại Đơn & Động Từ To Be',
          type: 'theory',
          duration: '20 phút',
          xp: 60,
          summary: 'Học cách diễn tả sự thật, thói quen và trạng thái hàng ngày.',
          content: {
            theory: `### 1. Động Từ "To Be" (am / is / are)
- **I** + **am** (I'm a student)
- **He / She / It / Danh từ số ít** + **is** (She is smart)
- **You / We / They / Danh từ số nhiều** + **are** (They are friendly)

### 2. Động Từ Thường (Present Simple)
- **Khẳng định:** S + V(s/es)
  - Ví dụ: *I work every day.* / *He works at Google.*
- **Phủ định:** S + do/does + not + V_bare
  - Ví dụ: *She doesn't like coffee.*
- **Nghi vấn:** Do/Does + S + V_bare?
  - Ví dụ: *Do you speak English?*`,
            quiz: [
              {
                question: 'Chọn câu đúng:',
                options: ['She don\'t like tea.', 'She doesn\'t likes tea.', 'She doesn\'t like tea.', 'She not like tea.'],
                correct: 2,
                explanation: 'Sau trợ động từ "doesn\'t", động từ chính giữ nguyên thể "like".'
              }
            ]
          }
        },
        {
          id: 'en-1-3',
          title: 'Bài 3: Giao Tiếp Chào Hỏi & Giới Thiệu Bản Thân',
          type: 'roleplay',
          duration: '25 phút',
          xp: 80,
          summary: 'Thực hành chào hỏi, giới thiệu tên, tuổi, nghề nghiệp với trợ lý AI.',
          scenarioId: 'en-greeting'
        }
      ]
    },
    {
      id: 'en-stage-2',
      number: 2,
      title: 'Chặng 2: Giao Tiếp Phản Xạ & Công Sở (A2 - B1)',
      description: 'Luyện giao tiếp đời sống, du lịch, mua sắm và trao đổi công việc cơ bản.',
      badge: '💬 Giao tiếp',
      color: 'from-blue-500 to-indigo-700',
      lessons: [
        {
          id: 'en-2-1',
          title: 'Bài 1: Từ Vựng & Kịch Bản Du Lịch, Đặt Phòng Khách Sạn',
          type: 'theory',
          duration: '20 phút',
          xp: 70,
          summary: 'Mẫu câu cực dụng khi đi du lịch nước ngoài, làm thủ tục check-in.',
          content: {
            theory: `### 1. Mẫu câu tại Sân Bay & Khách Sạn
- **Check-in:** *"I'd like to check in, please. Here is my booking confirmation."*
- **Hỏi đường:** *"Could you tell me how to get to the nearest MRT station?"*
- **Yêu cầu hỗ trợ:** *"Could I have an extra towel in my room, please?"*
- **Thanh toán:** *"Can I pay by credit card or mobile pay?"*`,
            quiz: [
              {
                question: 'Khi muốn làm thủ tục nhận phòng khách sạn, bạn nói:',
                options: ['I want to buy a room', 'I\'d like to check in, please', 'Where is the kitchen?', 'Check out now!'],
                correct: 1,
                explanation: '"I\'d like to check in, please" là mẫu câu chuẩn và lịch sự nhất.'
              }
            ]
          }
        },
        {
          id: 'en-2-2',
          title: 'Bài 2: Roleplay - Đặt Đồ Ăn & Gọi Món Tại Nhà Hàng',
          type: 'roleplay',
          duration: '25 phút',
          xp: 85,
          summary: 'Nhập vai khách hàng gọi món tại nhà hàng sang trọng với bồi bàn AI.',
          scenarioId: 'en-restaurant'
        }
      ]
    },
    {
      id: 'en-stage-3',
      number: 3,
      title: 'Chặng 3: Tiếng Anh Chuyên Nghiệp (B2 - C1)',
      description: 'Phỏng vấn xin việc, thuyết trình dự án và đàm phán thương mại.',
      badge: '🚀 Chuyên nghiệp',
      color: 'from-purple-500 to-pink-700',
      lessons: [
        {
          id: 'en-3-1',
          title: 'Bài 1: Kỹ Năng Phỏng Vấn Xin Việc Trực Tiếp Bằng Tiếng Anh',
          type: 'roleplay',
          duration: '30 phút',
          xp: 100,
          summary: 'Mô phỏng buổi phỏng vấn vị trí Senior với Nhà tuyển dụng AI.',
          scenarioId: 'en-job-interview'
        }
      ]
    }
  ]
};
