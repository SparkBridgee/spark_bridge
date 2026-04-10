# Apify API Reference

공통 토큰: `APIFY_API_TOKEN` (환경변수)

---

## 1. TikTok Scraper (`clockworks~tiktok-scraper`)

### Endpoints

| 용도 | Method | URL |
|------|--------|-----|
| Actor 실행 | POST | `https://api.apify.com/v2/acts/clockworks~tiktok-scraper/runs?token=***` |
| 실행 + 결과 대기 | POST | `https://api.apify.com/v2/acts/clockworks~tiktok-scraper/run-sync?token=***` |
| 실행 + dataset 반환 | POST | `https://api.apify.com/v2/acts/clockworks~tiktok-scraper/run-sync-get-dataset-items?token=***` |
| Actor 정보 | GET | `https://api.apify.com/v2/acts/clockworks~tiktok-scraper?token=***` |
| 마지막 실행 결과 | GET | `https://api.apify.com/v2/acts/clockworks~tiktok-scraper/runs/last/dataset/items?token=***` |
| OpenAPI 스키마 | GET | `https://api.apify.com/v2/acts/clockworks~tiktok-scraper/builds/default/openapi.json` |

### Input (POST body)

```json
{
  "hashtags": ["skincare"],
  "resultsPerPage": 20,
  "shouldDownloadVideos": false
}
```

| 필드 | 타입 | 설명 | 기본값 |
|------|------|------|--------|
| `hashtags` | string[] | 검색할 해시태그 목록 | - |
| `profiles` | string[] | 스크래핑할 유저네임/유저ID | - |
| `resultsPerPage` | int (1~1,000,000) | 해시태그/프로필/검색 당 결과 수 | 1 |
| `profileScrapeSections` | string[] | `["videos"]` or `["reposts"]` | `["videos"]` |
| `profileSorting` | string | `latest` / `popular` / `oldest` | `latest` |
| `excludePinnedPosts` | bool | 고정 게시물 제외 | false |
| `shouldDownloadVideos` | bool | 비디오 다운로드 여부 | false |

### Output (응답 필드)

```json
{
  "id": "7624860523129015583",
  "text": "talk about skin that looks like glass...",
  "createTime": 1743537605,
  "createTimeISO": "2025-04-01T...",
  "authorMeta": {
    "name": "shelbyannbell",
    "nickName": "Shelby Ann",
    "avatar": "https://..."
  },
  "playCount": 775800,
  "diggCount": 76100,
  "commentCount": 1234,
  "shareCount": 567,
  "collectCount": 890,
  "webVideoUrl": "https://www.tiktok.com/@shelbyannbell/video/...",
  "videoMeta": { "coverUrl": "https://..." },
  "hashtags": [{ "name": "skincare" }]
}
```

---

## 2. Instagram Scraper (`apify~instagram-scraper`)

### Endpoints

| 용도 | Method | URL |
|------|--------|-----|
| Actor 실행 | POST | `https://api.apify.com/v2/acts/apify~instagram-scraper/runs?token=***` |
| 실행 + 결과 대기 | POST | `https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync?token=***` |
| 실행 + dataset 반환 | POST | `https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=***` |
| Actor 정보 | GET | `https://api.apify.com/v2/acts/apify~instagram-scraper?token=***` |
| 마지막 실행 결과 | GET | `https://api.apify.com/v2/acts/apify~instagram-scraper/runs/last/dataset/items?token=***` |
| OpenAPI 스키마 | GET | `https://api.apify.com/v2/acts/apify~instagram-scraper/builds/default/openapi.json` |

### Input (POST body)

**해시태그 검색 (directUrls 방식 - 포스트 데이터 반환)**
```json
{
  "directUrls": ["https://www.instagram.com/explore/tags/skincare/"],
  "resultsType": "posts",
  "resultsLimit": 20,
  "addParentData": false
}
```

**프로필 스크래핑**
```json
{
  "directUrls": ["https://www.instagram.com/humansofny/"],
  "resultsType": "posts",
  "resultsLimit": 200,
  "addParentData": false
}
```

**키워드 검색 (search 방식 - 메타데이터만 반환, 포스트 X)**
```json
{
  "search": "skincare",
  "searchType": "hashtag",
  "searchLimit": 1,
  "resultsType": "posts",
  "resultsLimit": 20
}
```

| 필드 | 타입 | 설명 | 기본값 |
|------|------|------|--------|
| `directUrls` | string[] | 직접 URL (프로필, 해시태그, 게시물) | - |
| `resultsType` | string | `posts` / `comments` / `details` | `posts` |
| `resultsLimit` | int | URL당 최대 결과 수 | - |
| `search` | string | 검색 키워드 | - |
| `searchType` | string | `hashtag` / `user` / `place` | `hashtag` |
| `searchLimit` | int | 검색 결과 수 | - |
| `addParentData` | bool | 부모 메타데이터 추가 | false |
| `onlyPostsNewerThan` | string | 날짜 필터 (ISO format) | - |

### Output (응답 필드)

```json
{
  "id": "3869167893477101612",
  "type": "Image",
  "shortCode": "DWyC7MLDJAs",
  "caption": "Yağlı parıltıya stop...",
  "url": "https://www.instagram.com/p/DWyC7MLDJAs/",
  "displayUrl": "https://scontent-vie1-1.cdninstagram.com/...",
  "videoUrl": "",
  "likesCount": 0,
  "commentsCount": 0,
  "videoViewCount": null,
  "ownerUsername": "etatpur.azerbaijan",
  "ownerFullName": "",
  "hashtags": ["skincare", "beauty"],
  "timestamp": "2025-04-06T...",
  "productType": "feed"
}
```

> **참고**: `search` 파라미터로 호출하면 해시태그 메타데이터만 반환됨. 실제 포스트를 가져오려면 반드시 `directUrls`를 사용할 것.

---

## 공통 참고

- `run-sync-get-dataset-items`: 동기 실행 후 바로 dataset items 반환 (우리 앱에서 사용)
- `runs/last/dataset/items?status=SUCCEEDED`: 마지막 성공 실행의 결과 조회
- 토큰은 https://console.apify.com/account/integrations 에서 발급
