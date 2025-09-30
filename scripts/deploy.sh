#!/bin/bash

# 🚀 빠른 배포 스크립트
# 사용법: ./scripts/deploy.sh "커밋 메시지"

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 TODO App 배포 스크립트 시작${NC}"

# 커밋 메시지 확인
if [ -z "$1" ]; then
    echo -e "${YELLOW}⚠️ 커밋 메시지를 입력하세요${NC}"
    echo "사용법: ./scripts/deploy.sh \"커밋 메시지\""
    exit 1
fi

COMMIT_MESSAGE="$1"

echo -e "${BLUE}📝 커밋 메시지: ${COMMIT_MESSAGE}${NC}"

# 현재 브랜치 확인
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}🌿 현재 브랜치: ${CURRENT_BRANCH}${NC}"

if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}⚠️ main 브랜치가 아닙니다. main으로 전환할까요? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        git checkout main
        echo -e "${GREEN}✅ main 브랜치로 전환 완료${NC}"
    else
        echo -e "${RED}❌ 배포가 취소되었습니다${NC}"
        exit 1
    fi
fi

# Git 상태 확인
echo -e "${BLUE}🔍 Git 상태 확인 중...${NC}"
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}📝 변경된 파일들:${NC}"
    git status -s
    
    echo -e "${YELLOW}⚠️ 변경사항을 커밋하시겠습니까? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        git add .
        git commit -m "$COMMIT_MESSAGE"
        echo -e "${GREEN}✅ 커밋 완료${NC}"
    else
        echo -e "${RED}❌ 변경사항이 커밋되지 않았습니다${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ 변경사항이 없습니다${NC}"
fi

# 최신 상태 확인
echo -e "${BLUE}🔄 원격 저장소에서 최신 변경사항 가져오는 중...${NC}"
git fetch origin

# 로컬과 원격 비교
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" != "$REMOTE" ]; then
    echo -e "${YELLOW}⚠️ 로컬과 원격이 다릅니다. 푸시하시겠습니까? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo -e "${BLUE}📤 main 브랜치로 푸시 중...${NC}"
        git push origin main
        echo -e "${GREEN}✅ 푸시 완료!${NC}"
    else
        echo -e "${RED}❌ 배포가 취소되었습니다${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ 이미 최신 상태입니다${NC}"
fi

# GitHub Actions 상태 확인 (선택사항)
echo -e "${BLUE}🔗 GitHub Actions에서 배포 상태를 확인하세요:${NC}"
REPO_URL=$(git config --get remote.origin.url | sed 's/\.git$//')
if [[ "$REPO_URL" == *"github.com"* ]]; then
    # SSH URL을 HTTPS로 변환
    if [[ "$REPO_URL" == git@github.com:* ]]; then
        REPO_URL=$(echo "$REPO_URL" | sed 's/git@github.com:/https:\/\/github.com\//')
    fi
    echo -e "${BLUE}${REPO_URL}/actions${NC}"
fi

echo -e "${GREEN}🎉 배포 스크립트 완료! GitHub Actions에서 자동 배포가 시작됩니다.${NC}"
echo -e "${YELLOW}💡 배포 상태는 위 링크에서 확인할 수 있습니다.${NC}"