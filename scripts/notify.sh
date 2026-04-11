#!/usr/bin/env bash
set -euo pipefail

: "${SITE_URL:?SITE_URL is required}"
: "${NTFY_TOPIC:?NTFY_TOPIC is required}"

RESPONSE=$(curl -s "$SITE_URL/api/prediction")
DAYS=$(echo "$RESPONSE" | jq -r '.daysUntil // empty')

if [ -z "$DAYS" ]; then
  echo "Failed to get daysUntil from API. Response: $RESPONSE"
  exit 1
fi

echo "Days until next period: $DAYS"

if [ "$DAYS" -le 5 ] && [ "$DAYS" -gt 0 ]; then
  curl -d "预计 ${DAYS} 天后来大姨妈" ntfy.sh/$NTFY_TOPIC
elif [ "$DAYS" -eq 0 ]; then
  curl -d "预计今天来大姨妈" ntfy.sh/$NTFY_TOPIC
elif [ "$DAYS" -lt 0 ]; then
  OVERDUE=$(( -DAYS ))
  curl -d "大姨妈已超期 ${OVERDUE} 天" ntfy.sh/$NTFY_TOPIC
else
  if [ "${DEBUG:-}" = "true" ]; then
    curl -d "没事，就是发个通知玩玩 (${DAYS}天)" ntfy.sh/$NTFY_TOPIC
  else
    echo "No notification needed (${DAYS} days away)"
  fi
fi
