# Tailwind CSS 문제 해결 방안

## 🔍 문제 진단

### 주요 문제점

1. **Tailwind CSS v4 호환성 문제**: 현재 프로젝트는 v3 스타일로 설정되었지만 v4가 설치됨
2. **커스텀 클래스 인식 실패**: `shadow-glass` 등 커스텀 클래스가 빌드 시 인식되지 않음
3. **@import 구문 문제**: v4에서 변경된 임포트 방식과 호환되지 않음

### 빌드 오류

```
Error: Cannot apply unknown utility class `shadow-glass`
```

## 🛠️ 해결 방안

### 방안 1: Tailwind CSS v3로 다운그레이드 (권장)

현재 프로젝트가 v3 구조에 맞춰져 있으므로 안정적인 v3 사용:

```bash
npm uninstall tailwindcss @tailwindcss/postcss
npm install -D tailwindcss@^3.4.0 postcss autoprefixer
npx tailwindcss init -p
```

#### globals.css 수정

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
  }
  /* 기존 스타일 유지 */
}
```

#### postcss.config.mjs 수정

```javascript
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

export default config
```

### 방안 2: Tailwind CSS v4로 완전 마이그레이션

프로젝트를 v4 스타일로 완전히 변경:

#### globals.css를 v4 스타일로 변경

```css
@import 'tailwindcss';

@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
  }
  /* 커스텀 스타일들을 CSS 변수로 변경 */
}
```

#### tailwind.config.ts를 @config로 변경

CSS 파일 내에서 직접 설정하거나 새로운 v4 설정 방식 사용

## 🎯 권장 해결책

**방안 1 (v3 다운그레이드)**를 권장하는 이유:

- 현재 프로젝트 구조와 완벽 호환
- 검증된 안정적인 버전
- 즉시 문제 해결 가능
- 기존 코드 변경 최소화

## 🔧 단계별 수정 작업

1. 패키지 다운그레이드
2. PostCSS 설정 수정
3. globals.css import 구문 수정
4. 빌드 테스트 및 검증
