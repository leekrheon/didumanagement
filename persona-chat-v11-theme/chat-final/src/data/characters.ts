import { Character } from '../types';

export const CHARACTERS: Character[] = [
  {
    id: 'sujin',
    name: '수진',
    age: 26,
    bio: '카페에서 그림을 그리는 것을 좋아하는 일러스트레이터입니다.',
    image: '/char.png',
    bgImage: '/back.png',
    sessions: [
      {
        dialogues: [
          { type: 'normal', text: '안녕! 오늘 여기 처음 왔어? 나는 여기 단골인데 😊' },
          { type: 'normal', text: '나 일러스트레이터야. 카페에서 그림 그리는 게 취미이자 일이거든.' },
          { type: 'normal', text: '근데 요즘 피부가 너무 건조해서 고민이야. 날씨 때문인가...' },
          {
            type: 'ad',
            text: '아 맞다! 친구한테 추천받은 세럼 써봤는데 진짜 달라졌어. 라운드랩 자작나무 수분크림이었나? 되게 가볍고 촉촉하더라고.',
            adBrand: 'ROUNDLAB',
          },
          {
            type: 'quiz',
            text: '근데 너는 피부 어떤 타입이야? 나랑 같은 건성인가?',
            quizOptions: ['지성 피부야', '건성 피부야', '복합성이야', '잘 모르겠어'],
            quizAnswer: 1,
          },
          { type: 'normal', text: '어머 나랑 같네! 그럼 더 잘 맞겠다 😄' },
          { type: 'normal', text: '다음에 같이 스케치하러 오지 않을래? 내가 자주 오는 자리 있어.' },
          { type: 'normal', text: '오늘 대화 즐거웠어. 또 봐요 😊' },
        ],
      },
      {
        dialogues: [
          { type: 'normal', text: '어, 또 왔네! 반가워 😊' },
          { type: 'normal', text: '오늘은 새 프로젝트 작업 중이야. 브랜드 로고 디자인인데 쉽지 않더라고.' },
          { type: 'normal', text: '디자인할 때 제일 힘든 게 뭔지 알아? 클라이언트 피드백이야 ㅋㅋ' },
          { type: 'normal', text: '그래도 완성됐을 때 뿌듯함은 진짜 최고거든.' },
          {
            type: 'quiz',
            text: '너는 창작 활동 같은 거 해본 적 있어?',
            quizOptions: ['그림 그려봤어', '글 써봤어', '음악 해봤어', '없어'],
            quizAnswer: 0,
          },
          { type: 'normal', text: '오 멋지다! 취미로도 창작하는 사람 좋아.' },
          {
            type: 'ad',
            text: '참고로 나 요즘 웨이브온 태블릿 쓰는데 진짜 신세계야. 손 그림 느낌 그대로 나와서 너무 좋아.',
            adBrand: 'WAVEON',
          },
          { type: 'normal', text: '다음에 작업물 보여줄게! 기대해도 좋아 😄' },
        ],
      },
      {
        dialogues: [
          { type: 'normal', text: '오늘도 여기야? 나도 방금 왔어 ☕' },
          { type: 'normal', text: '요즘 개인 전시회 준비 중이야. 처음이라 엄청 긴장돼.' },
          { type: 'normal', text: '테마를 뭘로 할지 계속 고민 중인데... 도심 속 일상을 담고 싶어.' },
          {
            type: 'quiz',
            text: '전시회 가면 어떤 그림이 제일 끌려?',
            quizOptions: ['풍경화', '인물화', '추상화', '일러스트'],
            quizAnswer: 3,
          },
          { type: 'normal', text: '역시! 나도 일러스트 제일 좋아. 감사 😊' },
          {
            type: 'ad',
            text: '전시 준비하면서 모니터 색감이 중요하더라고. 벤큐 아트 모니터 써봤는데 색 표현이 진짜 달라.',
            adBrand: 'BENQ',
          },
          { type: 'normal', text: '전시 오픈하면 꼭 알려줄게! 와줄 거지?' },
          { type: 'normal', text: '오늘도 좋은 대화였어. 고마워 😊' },
        ],
      },
      {
        dialogues: [
          { type: 'normal', text: '안녕! 오늘 날씨 너무 좋다 ☀️' },
          { type: 'normal', text: '오늘은 야외 스케치 다녀왔어. 한강 뷰가 진짜 예쁘더라.' },
          { type: 'normal', text: '야외 작업할 때 빛이 계속 바뀌는 게 어렵긴 한데, 그게 또 매력이야.' },
          { type: 'normal', text: '너도 밖에서 뭔가 해본 적 있어? 야외 활동 좋아해?' },
          {
            type: 'quiz',
            text: '좋아하는 계절이 어떻게 돼?',
            quizOptions: ['봄', '여름', '가을', '겨울'],
            quizAnswer: 0,
          },
          { type: 'normal', text: '봄이구나! 봄에 꽃 스케치 같이 하면 너무 좋겠다 🌸' },
          {
            type: 'ad',
            text: '야외 스케치할 때 이젤이 너무 무거웠는데, 하코 접이식 이젤 쓰니까 진짜 편해졌어.',
            adBrand: 'HACO',
          },
          { type: 'normal', text: '다음 야외 스케치 같이 가자! 내가 좋은 곳 알아 😊' },
        ],
      },
      {
        dialogues: [
          { type: 'normal', text: '오늘 여기 특별히 이유 있어서 왔어. 드디어 전시 끝났거든!' },
          { type: 'normal', text: '반응이 생각보다 너무 좋았어. 심지어 작품 구매하겠다는 분도 있었고.' },
          { type: 'normal', text: '솔직히 처음엔 아무도 안 올까봐 걱정했는데 ㅋㅋ' },
          {
            type: 'quiz',
            text: '너라면 전시 작품 구매할 것 같아?',
            quizOptions: ['응, 마음에 들면!', '비싸면 안 살 것 같아', '소품이면 살게', '생각 없어'],
            quizAnswer: 0,
          },
          { type: 'normal', text: '오 고마워! 그 말이 제일 힘이 되네 😭' },
          {
            type: 'ad',
            text: '전시 홍보할 때 캔바 프로 썼는데 포스터 만들기 진짜 쉬워. 나 같은 디자이너도 시간 엄청 절약했어.',
            adBrand: 'CANVA',
          },
          { type: 'normal', text: '이제 다음 작업 또 시작해야지. 쉬면 손이 굳는 것 같아서.' },
          { type: 'normal', text: '앞으로도 자주 와줘. 너랑 얘기하면 영감 받는 기분이야 😊' },
        ],
      },
    ],
  },
  {
    id: 'minho',
    name: '민호',
    age: 30,
    bio: '도시의 공간을 설계하는 건축가입니다.',
    image: '/char.png',
    bgImage: '/back.png',
    sessions: [
      {
        dialogues: [
          { type: 'normal', text: '반갑습니다. 새로 오신 분인가요?' },
          { type: 'normal', text: '저는 건물을 짓는 일을 하고 있습니다.' },
          { type: 'normal', text: '공간이 사람의 마음을 바꾼다고 믿거든요.' },
          { type: 'normal', text: '당신에게 가장 편안한 장소는 어디인가요?' },
          {
            type: 'quiz',
            text: '사람들이 가장 오래 머무는 공간은 어디일까요?',
            quizOptions: ['카페', '도서관', '집', '공원'],
            quizAnswer: 2,
          },
          { type: 'normal', text: '역시 집이군요. 저도 그렇게 생각합니다.' },
          { type: 'normal', text: '좋은 공간은 결국 사람을 쉬게 만들어야 한다고 봐요.' },
          { type: 'normal', text: '흥미로운 답변이었습니다. 다음에 또 이야기해요.' },
        ],
      },
      {
        dialogues: [
          { type: 'normal', text: '또 뵙네요. 반갑습니다 😊' },
          { type: 'normal', text: '요즘 주거 단지 설계 프로젝트를 맡았는데 꽤 규모가 커요.' },
          { type: 'normal', text: '단순히 건물만 짓는 게 아니라 그 안의 사람들 삶을 설계하는 느낌이에요.' },
          {
            type: 'ad',
            text: '설계 소프트웨어로 요즘 스케치업 프로를 쓰는데 3D 시뮬레이션이 정말 편리하더군요.',
            adBrand: 'SKETCHUP',
          },
          {
            type: 'quiz',
            text: '새 집을 고른다면 어떤 조건이 제일 중요할까요?',
            quizOptions: ['위치와 교통', '넓은 공간', '햇빛과 채광', '조용한 환경'],
            quizAnswer: 2,
          },
          { type: 'normal', text: '채광이군요. 저도 설계할 때 채광을 가장 신경 씁니다.' },
          { type: 'normal', text: '빛이 잘 드는 공간은 사람을 건강하게 만들거든요.' },
          { type: 'normal', text: '오늘도 좋은 대화였습니다. 감사해요.' },
        ],
      },
      {
        dialogues: [
          { type: 'normal', text: '안녕하세요. 오늘도 이 카페에 오셨네요.' },
          { type: 'normal', text: '저도 마침 도면 검토하러 나왔어요.' },
          { type: 'normal', text: '건축가로서 가장 좋아하는 건물이 뭐냐고 물어보면 저는 항상 판테온을 얘기해요.' },
          { type: 'normal', text: '2000년이 된 건물인데 아직도 완벽하게 서 있다는 게 신기하지 않나요?' },
          {
            type: 'quiz',
            text: '한국에서 좋아하는 건축물이 있나요?',
            quizOptions: ['경복궁', '광화문', '63빌딩', '동대문 DDP'],
            quizAnswer: 3,
          },
          { type: 'normal', text: 'DDP! 자하 하디드의 작품이죠. 저도 정말 좋아합니다.' },
          {
            type: 'ad',
            text: '설계 도면 출력할 때 캐논 대형 프린터 쓰는데, 색상 정확도가 정말 뛰어나요.',
            adBrand: 'CANON',
          },
          { type: 'normal', text: '다음에도 건축 이야기 해요. 반가운 대화였습니다 😊' },
        ],
      },
      {
        dialogues: [
          { type: 'normal', text: '오늘 현장 방문 다녀오는 길이에요. 피곤하긴 한데 성취감이 있죠.' },
          { type: 'normal', text: '기초 공사가 끝나고 골조가 올라가는 걸 보면 진짜 뿌듯해요.' },
          { type: 'normal', text: '설계도 중요하지만 실제 시공 과정에서 배우는 게 더 많더라고요.' },
          {
            type: 'quiz',
            text: '건물 짓는 것과 관련해서 관심 있는 분야가 있나요?',
            quizOptions: ['인테리어 디자인', '도시 계획', '친환경 건축', '스마트홈'],
            quizAnswer: 2,
          },
          { type: 'normal', text: '친환경 건축! 저도 요즘 가장 관심 갖는 분야예요.' },
          {
            type: 'ad',
            text: '친환경 건축 자재 중에 KCC 단열재가 성능이 정말 좋아요. 에너지 효율이 확 달라지거든요.',
            adBrand: 'KCC',
          },
          { type: 'normal', text: '앞으로 건물이 더 지속 가능해져야 한다고 생각해요.' },
          { type: 'normal', text: '오늘도 좋은 이야기 감사합니다 😊' },
        ],
      },
      {
        dialogues: [
          { type: 'normal', text: '드디어 프로젝트 완공됐어요! 기분이 너무 좋네요 🎉' },
          { type: 'normal', text: '2년짜리 프로젝트였는데 막상 끝나니까 허전하기도 해요.' },
          { type: 'normal', text: '완공된 건물에 처음 사람들이 들어오는 순간이 제일 보람 있어요.' },
          { type: 'normal', text: '그 공간에서 누군가의 삶이 시작된다고 생각하면 묘한 기분이거든요.' },
          {
            type: 'quiz',
            text: '당신도 어떤 일을 완성했을 때 어떤 기분이에요?',
            quizOptions: ['엄청 뿌듯해', '바로 다음 걸 생각해', '허전해', '잘 모르겠어'],
            quizAnswer: 0,
          },
          { type: 'normal', text: '뿌듯함이군요. 좋은 에너지네요 😊' },
          {
            type: 'ad',
            text: '완공 축하 자리에서 발렌시아 와인 마셨는데 분위기랑 정말 잘 맞았어요. 추천드려요.',
            adBrand: 'VALENCIA',
          },
          { type: 'normal', text: '앞으로도 이렇게 이야기 나눠요. 좋은 인연인 것 같아요.' },
        ],
      },
    ],
  },
  {
    id: 'yuna',
    name: '유나',
    age: 24,
    bio: '매일 아침 향긋한 커피를 내리는 바리스타입니다.',
    image: '/char.png',
    bgImage: '/back.png',
    sessions: [
      {
        dialogues: [
          { type: 'normal', text: '어서오세요! 오늘은 어떤 커피로 드릴까요?' },
          { type: 'normal', text: '저는 산미가 도는 원두를 특히 좋아해요.' },
          { type: 'normal', text: '커피 향을 맡으면 하루가 즐거워지거든요.' },
          {
            type: 'quiz',
            text: '당신은 어떤 커피를 좋아하세요?',
            quizOptions: ['아메리카노', '라떼', '콜드브루', '안 마셔요'],
            quizAnswer: 0,
          },
          { type: 'normal', text: '아메리카노! 깔끔하고 좋죠 ☕' },
          { type: 'normal', text: '원두 산지에 따라 맛이 완전 달라요. 에티오피아 원두 드셔보셨어요?' },
          { type: 'normal', text: '다음에 오시면 직접 내려드릴게요!' },
          { type: 'normal', text: '좋은 취향이시네요! 내일 또 놀러오세요 😊' },
        ],
      },
      {
        dialogues: [
          { type: 'normal', text: '또 오셨네요! 반가워요 😊' },
          { type: 'normal', text: '오늘은 새로운 원두 입고됐어요. 과테말라산인데 초콜릿 향이 나요.' },
          { type: 'normal', text: '커피 맛 표현하는 게 와인이랑 비슷해서 재밌어요.' },
          {
            type: 'ad',
            text: '집에서도 맛있게 마시고 싶으면 네스프레소 버추오 머신 추천해요. 캡슐인데도 카페 느낌 나거든요.',
            adBrand: 'NESPRESSO',
          },
          {
            type: 'quiz',
            text: '집에서 커피 어떻게 마셔요?',
            quizOptions: ['인스턴트 믹스', '캡슐 커피', '핸드드립', '안 마셔요'],
            quizAnswer: 1,
          },
          { type: 'normal', text: '캡슐 커피! 편하고 맛있죠 😄' },
          { type: 'normal', text: '그래도 가끔은 직접 내린 커피도 드셔보세요. 확실히 달라요.' },
          { type: 'normal', text: '오늘도 와주셔서 감사해요 ☕' },
        ],
      },
      {
        dialogues: [
          { type: 'normal', text: '오늘 날씨 쌀쌀하죠? 따뜻한 거 드릴게요.' },
          { type: 'normal', text: '저는 추운 날엔 꼭 플랫화이트 마셔요. 우유 거품이 따뜻해서 좋거든요.' },
          { type: 'normal', text: '요즘 바리스타 자격증 시험 준비 중이에요. 더 잘 내리고 싶어서요.' },
          { type: 'normal', text: '공부하다 보니 커피에 대해 몰랐던 게 너무 많더라고요.' },
          {
            type: 'quiz',
            text: '커피 관련해서 뭐가 제일 궁금해요?',
            quizOptions: ['원두 종류', '추출 방법', '나라별 커피 문화', '카페인 영향'],
            quizAnswer: 1,
          },
          { type: 'normal', text: '추출 방법! 이게 맛에 진짜 크게 영향을 줘요.' },
          {
            type: 'ad',
            text: '핸드드립 도구로 하리오 V60 추천해요. 입문용으로 딱이고 맛도 잘 나와요.',
            adBrand: 'HARIO',
          },
          { type: 'normal', text: '다음에 추출 방법 직접 보여드릴게요! 기대해요 😊' },
        ],
      },
      {
        dialogues: [
          { type: 'normal', text: '자격증 시험 봤어요! 합격했어요 🎉' },
          { type: 'normal', text: '필기는 어렵지 않았는데 실기가 긴장됐어요.' },
          { type: 'normal', text: '심사위원 앞에서 에스프레소 내리는 게 손이 떨리더라고요 ㅋㅋ' },
          { type: 'normal', text: '그래도 해냈으니까! 이제 더 자신 있게 내릴 수 있을 것 같아요.' },
          {
            type: 'quiz',
            text: '시험이나 발표 때 긴장하는 편이에요?',
            quizOptions: ['완전 긴장해', '조금 긴장해', '별로 안 해', '오히려 잘 돼'],
            quizAnswer: 0,
          },
          { type: 'normal', text: '저도요! 그래서 더 공감이 됐나봐요 😊' },
          {
            type: 'ad',
            text: '긴장 풀 때 루이보스 티가 진짜 도움돼요. 티젠 루이보스가 특히 향이 좋더라고요.',
            adBrand: 'TEAZEN',
          },
          { type: 'normal', text: '앞으로도 자주 와주세요! 항상 환영이에요 ☕' },
        ],
      },
      {
        dialogues: [
          { type: 'normal', text: '오늘이 여기서 마지막 근무예요. 이 카페 그만두고 창업하려고요.' },
          { type: 'normal', text: '작은 카페지만 제 공간 갖는 게 꿈이었거든요.' },
          { type: 'normal', text: '무섭기도 하지만 설레요. 드디어 시작하는 거잖아요.' },
          { type: 'normal', text: '메뉴도 제가 다 정하고, 인테리어도 제 취향대로 꾸밀 거예요.' },
          {
            type: 'quiz',
            text: '창업한다면 어떤 카페를 열고 싶어요?',
            quizOptions: ['아늑한 북카페', '트렌디한 감성 카페', '로스터리 커피 전문점', '딱히 없어요'],
            quizAnswer: 0,
          },
          { type: 'normal', text: '북카페! 저도 책 좋아해서 그 느낌 살리고 싶어요 😊' },
          {
            type: 'ad',
            text: '카페 오픈 준비하면서 올리브영에서 매장 용품 정말 많이 샀어요. 종류도 많고 편하더라고요.',
            adBrand: 'OLIVEYOUNG',
          },
          { type: 'normal', text: '오픈하면 꼭 알려드릴게요! 와주실 거죠? 😊' },
        ],
      },
    ],
  },
];

