<!-- docs/improvements.md -->
# 프로젝트 개선 사항

이 문서는 Roblox Studio MCP 서버 프로젝트 전반에 대해 자동 분석을 통해 도출된 주요 개선 제안을 정리한 목록입니다. 필요에 따라 우선순위를 검토하고 구현을 검토해 주세요.

## 1. 프로젝트 구조 및 모듈화
- `src/` 디렉토리 내 모듈별 책임(비즈니스 로직 vs 라우팅) 명확화
- 폴더 및 파일 네이밍 컨벤션 통일(예: camelCase vs kebab-case)
- `controllers`/`services`/`middlewares` 계층화 패턴 적용 고려

## 2. TypeScript 엄격 모드 활성화
- `tsconfig.json`에 `strict`, `noImplicitAny`, `strictNullChecks`, `strictPropertyInitialization` 등 활성화
- 인터페이스 및 제네릭 활용으로 타입 안전성 강화

## 3. 코드 스타일 및 린팅
- ESLint 및 Prettier 설정 통합(lint-staged, Husky 이용)하여 커밋 전 자동 포맷팅·린팅 적용
- 규칙 정의(줄 길이, 들여쓰기, 세미콜론 등)로 일관성 유지

## 4. 테스트 커버리지 및 품질
- 단위(Unit), 통합(Integration), E2E 테스트 분리 및 CI 연동
- 테스트 커버리지 유지(예: 80% 이상) 및 GitHub Actions에서 자동 리포트 생성
- 외부 API/DB 호출 모킹 활용으로 테스트 안정성 제고

## 5. CI/CD 파이프라인 개선
- GitHub Actions 워크플로우 단계별 구성(릴퀘 검증, 빌드, 린트, 테스트, 배포)
- Dev/Staging/Prod 환경 분리 및 자동 배포 트리거 설정

## 6. 문서화 강화
- Docsify/Swagger 페이지(_sidebar.md)와 실제 파일 간 불일치 확인 및 보완
- 누락된 가이드(예: getting-started, configuration, changelog, guides) 추가
- JSDoc 주석 보강 및 문서 생성 스크립트 제공
- README 목차(Table of Contents) 추가로 가독성 개선

## 7. 보안(Security) 강화
- Helmet, CORS 등 HTTP 보안 헤더 검토
- 환경 변수 유효성 검사(라이브러리: joi, zod 등) 적용
- JWT(액세스/리프레시 토큰) 만료·재발급 로직 및 저장소 보안 검토
- OWASP ZAP/Snyk/Dependabot 연동으로 취약점 자동 스캔

## 8. 성능 최적화
- WebSocket/SSE 연결 관리 전략 개선 및 연결 풀링 고려
- Redis 등 캐시 레이어 도입 및 TTL 정책 수립
- 유저/IP 기반 세분화 Rate Limiting 적용
- K6 스크립트 확장 및 성능 테스트 시나리오 문서화

## 9. 로깅 및 모니터링
- Winston/Elastic Stack 연동 및 JSON 로그 표준화
- Prometheus 메트릭 수집 및 Grafana 대시보드 템플릿 제공
- 로그 로테이션 및 중앙 집중형 로그 시스템(EFK/ELK) 검토

## 10. 배포 및 컨테이너 최적화
- Docker 멀티스테이지 빌드 최적화 및 경량 이미지 사용(Alpine 등)
- docker-compose 예제에 볼륨, 네트워크, 시크릿 설정 추가
- Kubernetes(Helm) 매니페스트 샘플 제공 고려

## 11. 개발자 경험 개선
- pre-commit 훅(lint-staged, Husky) 적용으로 코드 스타일 자동화
- commit lint 및 Conventional Commit 규칙 적용
- 프로젝트 템플릿 및 초기화 스크립트 제공 고민

## 12. 에러 처리 및 유효성 검사
- 공통 에러 처리 미들웨어(에러 포맷, HTTP 상태 코드 일관성) 구현
- 요청 바디/쿼리/파라미터 유효성 검사 라이브러리(Celebrate, Joi, Zod 등) 사용

---
*작성: 자동 분석 도구(코드 리뷰 에이전트) 생성*