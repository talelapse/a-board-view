import { createContext, useContext } from 'react';

export type Language = 'en' | 'ko' | 'ja';

export const translations = {
  en: {
    // Navigation
    feed: 'Feed',
    match: 'Match',
    chats: 'Chats',
    post: 'Post',
    
    // Registration
    joinAnonymous: 'Join Anonymous',
    connectWithoutRevealing: 'Connect without revealing who you are',
    birthYear: 'Birth Year',
    gender: 'Gender',
    optionA: 'Option A',
    optionB: 'Option B',
    createAnonymousProfile: 'Create Anonymous Profile',
    creating: 'Creating...',
    identityRemains: 'Your identity remains completely anonymous. Only birth year and gender are used for matching.',
    
    // Feed
    noPosts: 'No posts yet',
    beFirstToShare: 'Be the first to share something with the community',
    createFirstPost: 'Create First Post',
    
    // Posts
    createPost: 'Create Post',
    whatsOnYourMind: "What's on your mind?",
    photoUrl: 'Photo (URL)',
    shareAnonymously: 'Share Anonymously',
    sharing: 'Sharing...',
    comments: 'comments',
    writeComment: 'Write a comment...',
    postComment: 'Post Comment',
    posting: 'Posting...',
    
    // Matching
    findMatch: 'Find a Match',
    connectWithRandom: 'Connect with someone random for a chat',
    startMatching: 'Start Matching',
    findingMatch: 'Finding your match...',
    lookingForSomeone: 'Looking for someone to chat with',
    matchFound: 'Match Found!',
    startChatting: 'Start Chatting',
    findAnother: 'Find Another',
    
    // Chat
    chat: 'Chat',
    online: 'Online',
    typeMessage: 'Type a message...',
    noChats: 'No chats yet',
    startRandomMatch: 'Start a random match to begin chatting with someone new',
    findSomeone: 'Find Someone',
    matched: 'Matched',
    someoneConnected: 'Someone connected',
    
    // Notifications
    welcome: 'Welcome!',
    profileCreated: 'Your anonymous profile has been created.',
    postCreated: 'Post created',
    postShared: 'Your anonymous post has been shared.',
    registrationFailed: 'Registration failed',
    pleaseFillFields: 'Please fill all fields',
    birthYearGenderRequired: 'Birth year and gender are required.',
    invalidBirthYear: 'Invalid birth year',
    validBirthYear: 'Please enter a valid birth year between 1950 and 2010.',
    pleaseWriteSomething: 'Please write something',
    postContentEmpty: 'Post content cannot be empty.',
    noMatchesFound: 'No matches found',
    tryAgainLater: 'Try again later when more users are online.',
    
    // Error pages
    pageNotFound: '404 Page Not Found',
    pageNotFoundDesc: 'Did you forget to add the page to the router?',
    
    // Loading states
    loadingFeed: 'Loading feed...',
    
    // Common
    born: 'Born',
    cancel: 'Cancel',
    close: 'Close',
    more: 'More',
    language: 'Language',
    korean: '한국어',
    english: 'English',
    japanese: '日本語',
  },
  ko: {
    // Navigation
    feed: '피드',
    match: '매칭',
    chats: '채팅',
    post: '게시물',
    
    // Registration
    joinAnonymous: '익명 참가',
    connectWithoutRevealing: '정체를 드러내지 않고 연결하세요',
    birthYear: '출생년도',
    gender: '성별',
    optionA: '옵션 A',
    optionB: '옵션 B',
    createAnonymousProfile: '익명 프로필 생성',
    creating: '생성 중...',
    identityRemains: '당신의 정체성은 완전히 익명으로 유지됩니다. 매칭에는 출생년도와 성별만 사용됩니다.',
    
    // Feed
    noPosts: '아직 게시물이 없습니다',
    beFirstToShare: '커뮤니티에 첫 번째로 무언가를 공유해 보세요',
    createFirstPost: '첫 게시물 작성',
    
    // Posts
    createPost: '게시물 작성',
    whatsOnYourMind: '무슨 생각을 하고 계신가요?',
    photoUrl: '사진 (URL)',
    shareAnonymously: '익명으로 공유',
    sharing: '공유 중...',
    comments: '댓글',
    writeComment: '댓글을 작성하세요...',
    postComment: '댓글 게시',
    posting: '게시 중...',
    
    // Matching
    findMatch: '매칭 찾기',
    connectWithRandom: '랜덤한 누군가와 채팅을 위해 연결하세요',
    startMatching: '매칭 시작',
    findingMatch: '매칭을 찾고 있습니다...',
    lookingForSomeone: '채팅할 사람을 찾고 있습니다',
    matchFound: '매칭 성공!',
    startChatting: '채팅 시작',
    findAnother: '다른 사람 찾기',
    
    // Chat
    chat: '채팅',
    online: '온라인',
    typeMessage: '메시지를 입력하세요...',
    noChats: '아직 채팅이 없습니다',
    startRandomMatch: '새로운 사람과 채팅을 시작하려면 랜덤 매칭을 시작하세요',
    findSomeone: '누군가 찾기',
    matched: '매칭됨',
    someoneConnected: '누군가 연결되었습니다',
    
    // Notifications
    welcome: '환영합니다!',
    profileCreated: '익명 프로필이 생성되었습니다.',
    postCreated: '게시물 작성됨',
    postShared: '익명 게시물이 공유되었습니다.',
    registrationFailed: '등록 실패',
    pleaseFillFields: '모든 필드를 입력해주세요',
    birthYearGenderRequired: '출생년도와 성별이 필요합니다.',
    invalidBirthYear: '잘못된 출생년도',
    validBirthYear: '1950년과 2010년 사이의 유효한 출생년도를 입력해주세요.',
    pleaseWriteSomething: '무언가를 작성해주세요',
    postContentEmpty: '게시물 내용이 비어있을 수 없습니다.',
    noMatchesFound: '매칭을 찾을 수 없습니다',
    tryAgainLater: '더 많은 사용자가 온라인일 때 다시 시도해주세요.',
    
    // Error pages
    pageNotFound: '404 페이지를 찾을 수 없습니다',
    pageNotFoundDesc: '라우터에 페이지를 추가하는 것을 잊으셨나요?',
    
    // Loading states
    loadingFeed: '피드를 불러오는 중...',
    
    // Common
    born: '출생',
    cancel: '취소',
    close: '닫기',
    more: '더보기',
    language: '언어',
    korean: '한국어',
    english: 'English',
    japanese: '日本語',
  },
  ja: {
    // Navigation
    feed: 'フィード',
    match: 'マッチング',
    chats: 'チャット',
    post: '投稿',
    
    // Registration
    joinAnonymous: '匿名参加',
    connectWithoutRevealing: '身元を明かすことなく接続',
    birthYear: '生年',
    gender: '性別',
    optionA: 'オプションA',
    optionB: 'オプションB',
    createAnonymousProfile: '匿名プロフィール作成',
    creating: '作成中...',
    identityRemains: 'あなたの身元は完全に匿名のまま保たれます。マッチングには生年と性別のみが使用されます。',
    
    // Feed
    noPosts: 'まだ投稿がありません',
    beFirstToShare: 'コミュニティで最初に何かを共有してみてください',
    createFirstPost: '最初の投稿を作成',
    
    // Posts
    createPost: '投稿作成',
    whatsOnYourMind: '今何を考えていますか？',
    photoUrl: '写真（URL）',
    shareAnonymously: '匿名で共有',
    sharing: '共有中...',
    comments: 'コメント',
    writeComment: 'コメントを書く...',
    postComment: 'コメント投稿',
    posting: '投稿中...',
    
    // Matching
    findMatch: 'マッチを見つける',
    connectWithRandom: 'ランダムな誰かとチャットで繋がる',
    startMatching: 'マッチング開始',
    findingMatch: 'マッチを探しています...',
    lookingForSomeone: 'チャットする相手を探しています',
    matchFound: 'マッチ成功！',
    startChatting: 'チャット開始',
    findAnother: '他の人を探す',
    
    // Chat
    chat: 'チャット',
    online: 'オンライン',
    typeMessage: 'メッセージを入力...',
    noChats: 'まだチャットがありません',
    startRandomMatch: '新しい人とのチャットを始めるにはランダムマッチングを開始してください',
    findSomeone: '誰かを探す',
    matched: 'マッチ済み',
    someoneConnected: '誰かが接続されました',
    
    // Notifications
    welcome: 'ようこそ！',
    profileCreated: '匿名プロフィールが作成されました。',
    postCreated: '投稿作成完了',
    postShared: '匿名投稿が共有されました。',
    registrationFailed: '登録失敗',
    pleaseFillFields: 'すべての項目を入力してください',
    birthYearGenderRequired: '生年と性別が必要です。',
    invalidBirthYear: '無効な生年',
    validBirthYear: '1950年から2010年の間の有効な生年を入力してください。',
    pleaseWriteSomething: '何かを書いてください',
    postContentEmpty: '投稿内容は空にできません。',
    noMatchesFound: 'マッチが見つかりません',
    tryAgainLater: 'より多くのユーザーがオンラインのときに再度お試しください。',
    
    // Error pages
    pageNotFound: '404 ページが見つかりません',
    pageNotFoundDesc: 'ルーターにページを追加するのを忘れましたか？',
    
    // Loading states
    loadingFeed: 'フィードを読み込み中...',
    
    // Common
    born: '生まれ',
    cancel: 'キャンセル',
    close: '閉じる',
    more: 'もっと見る',
    language: '言語',
    korean: '한국어',
    english: 'English',
    japanese: '日本語',
  }
};

let currentLanguage: Language = 'ko'; // Default to Korean

export function setLanguage(lang: Language) {
  currentLanguage = lang;
  localStorage.setItem('preferred_language', lang);
}

export function getLanguage(): Language {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('preferred_language');
    if (stored && (stored === 'en' || stored === 'ko' || stored === 'ja')) {
      currentLanguage = stored;
    }
  }
  return currentLanguage;
}

export function t(key: string): string {
  const keys = key.split('.');
  let value: any = translations[getLanguage()];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
}

// React Context for i18n
interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}