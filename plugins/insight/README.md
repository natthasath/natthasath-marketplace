# 🎉 insight

Plugin for **web analytics analysis** — pulls data from Google Analytics 4 and Microsoft Clarity through their official MCP servers, then presents it as a shareable web dashboard.

> [!NOTE]
> ทุก skill ใน plugin นี้เรียกใช้ผ่าน slash command เท่านั้น (`disable-model-invocation: true`) — ไม่ auto-trigger จากบทสนทนา

### ⭐ Skills

| Skill | วัตถุประสงค์ |
|---|---|
| `insight-ga4` | วิเคราะห์ Google Analytics 4 ผ่าน `google-analytics-mcp` — traffic เทียบช่วงเวลา (WoW/MoM), top pages, channel breakdown, funnel/conversion, real-time users, audience demographics |
| `insight-clarity` | วิเคราะห์พฤติกรรมผู้ใช้จาก Microsoft Clarity ผ่าน `clarity-mcp-server` — UX health check (rage/dead clicks), engagement time/scroll depth, session recording lookup พร้อมจัดการโควต้า API 10 requests/วันให้อัตโนมัติด้วย local cache |

### 🚀 Usage

```
/insight-ga4 <คำถามเกี่ยวกับ GA4 property>
/insight-clarity <คำถามเกี่ยวกับพฤติกรรมผู้ใช้บนเว็บไซต์>
```

### 🔌 Prerequisites

ทั้งสอง skill ต้องมี MCP server ที่เกี่ยวข้องเชื่อมต่ออยู่ก่อน (plugin นี้ไม่ได้ติดตั้ง
หรือตั้งค่า MCP ให้):

| Skill | MCP Server | Auth |
|---|---|---|
| `insight-ga4` | [`googleanalytics/google-analytics-mcp`](https://github.com/googleanalytics/google-analytics-mcp) | `gcloud auth application-default login` (scope `analytics.readonly`) |
| `insight-clarity` | [`microsoft/clarity-mcp-server`](https://github.com/microsoft/clarity-mcp-server) | API token จาก Clarity project (Settings → Data Export) |

**ข้อจำกัดสำคัญ:** Clarity API อนุญาตแค่ 10 requests/วัน/โปรเจกต์ (ดูย้อนหลังได้สูงสุด
3 วัน, สูงสุด 3 dimensions/request) — `insight-clarity` จัดการเรื่องนี้ให้อัตโนมัติ
ด้วย local cache ใน `scripts/clarity_cache.py` แต่ยังจำกัดตามโควต้าจริงของ Clarity อยู่ดี
