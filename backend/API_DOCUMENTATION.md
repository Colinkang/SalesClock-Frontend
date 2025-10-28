# API 接口文档

## 基础信息

- **Base URL**: `http://localhost:3001/api`
- **认证方式**: JWT Bearer Token
- **Content-Type**: `application/json`

## 认证

大多数 API 端点需要使用 JWT Bearer Token 进行认证。请在请求头中包含：

```
Authorization: Bearer <your-token>
```

---

## 1. 认证接口 (`/api/auth`)

### 1.1 登录

**POST** `/api/auth/login`

**请求体**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应**:
```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "USER"
  }
}
```

**错误响应**:
- `401` - 邮箱或密码错误
- `400` - 请求数据格式错误

---

### 1.2 注册

**POST** `/api/auth/register`

**请求体**:
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User",
  "invitationToken": "optional-invitation-token"
}
```

**响应**: 同登录响应

**错误响应**:
- `400` - 用户已存在
- `400` - 邀请令牌无效

---

### 1.3 获取当前用户信息

**GET** `/api/auth/me`

**请求头**: 需要包含 JWT Token

**响应**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "User Name",
  "role": "USER",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**错误响应**:
- `401` - 未提供令牌或令牌无效
- `404` - 用户不存在

---

## 2. 客户接口 (`/api/customers`)

所有接口需要认证。

### 2.1 获取客户列表

**GET** `/api/customers`

**响应**:
```json
[
  {
    "id": "uuid",
    "name": "Customer Name",
    "phone": "13800138000",
    "address": "Customer Address",
    "latitude": "31.2304",
    "longitude": "121.4737",
    "notes": "Notes",
    "createdBy": "user-uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "visitPlans": [
      {
        "id": "uuid",
        "plannedDate": "2024-01-15T00:00:00.000Z",
        "status": "PENDING"
      }
    ]
  }
]
```

---

### 2.重复客户详情

**GET** `/api/customers/:id`

**响应**:
```json
{
  "id": "uuid",
  "name": "Customer Name",
  "phone": "13800138000",
  "address": "Customer Address",
  "latitude": "31.2304",
  "longitude": "121.4737",
  "notes": "Notes",
  "createdBy": "user-uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "visitPlans": [
    {
      "id": "uuid",
      "plannedDate": "2024-01-15T00:00:00.000Z",
      "status": "PENDING",
      "reports": [
        {
          "id": "uuid",
          "startTime": "2024-01-15T09:00:00.000Z",
          "endTime": "2024-01-15T10:00:00.000Z"
        }
      ]
    }
  ]
}
```

**错误响应**:
- `404` - 客户不存在

---

### 2.3 创建客户

**POST** `/api/customers`

**请求体**:
```json
{
  "name": "Customer Name",
  "phone": "13800138000",
  "address": "Customer Address",
  "latitude": "31.2304",
  "longitude": "121.4737",
  "notes": "Notes"
}
```

**响应**: 返回创建的客户对象

---

### 2.4 更新客户

**PUT** `/api/customers/:id`

**请求体**: 同创建客户（所有字段可选）

**响应**: 返回更新后的客户对象

**错误响应**:
- `404` - 客户不存在

---

### 2.5 删除客户

**DELETE** `/api/customers/:id`

**响应**:
```json
{
  "success": true
}
```

**错误响应**:
- `404` - 客户不存在

---

## 3. 拜访计划接口 (`/api/visit-plans`)

所有接口需要认证。

### 3.1 获取拜访计划列表

**GET** `/api/visit-plans`

**查询参数**:
- `date` (可选) - 指定日期，格式: `YYYY-MM-DD`
- `month` (可选) - 指定月份，格式: `YYYY-MM`

**响应**:
```json
[
  {
    "id": "uuid",
    "customerId": "customer-uuid",
    "plannedDate": "2024-01-15T00:00:00.000Z",
    "status": "PENDING",
    "checkInTime": null,
    "checkInLatitude": null,
    "checkInLongitude": null,
    "checkInPhotoUrl": null,
    "checkInNotes": null,
    "checkOutTime": null,
    "createdBy": "user-uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "customer": {
      "id": "customer-uuid",
      "name": "Customer Name",
      "phone": "13800138000"
    }
  }
]
```

---

### 3.2 获取拜访计划详情

**GET** `/api/visit-plans/:id`

**响应**: 同列表返回，并包含 `reports` 数组

---

### 3.3 创建拜访计划

**POST** `/api/visit-plans`

**请求体**:
```json
{
  "customerId": "customer-uuid",
  "plannedDate": "2024-01-15T09:00:00.000Z"
}
```

**响应**: 返回创建的拜访计划对象（包含 customer 信息）

---

### 3.4 更新拜访计划

**PUT** `/api/visit-plans/:id`

**请求体**: 要更新的字段（可选）

**响应**: 返回更新后的拜访计划对象

**错误响应**:
- `404` - 拜访计划不存在

---

### 3.5 删除拜访计划

**DELETE** `/api/visit-plans/:id`

**响应**:
```json
{
  "success": true
}
```

---

### 3.6 签到

**POST** `/api/visit-plans/:id/check-in`

**请求体**:
```json
{
  "latitude": "31.2304",
  "longitude": "121.4737",
  "photoUrl": "https://example.com/photo.jpg",
  "notes": "Notes"
}
```

**响应**: 返回更新后的拜访计划对象，`status` 为 `CHECKED_IN`

---

## 4. 拜访报告接口 (`/api/visit-reports`)

所有接口需要认证。

### 4.1 获取拜访报告列表

**GET**》/api/visit-reports

**响应**:
```json
[
  {
    "id": "uuid",
    "visitPlanId": "plan-uuid",
    "customerId": "customer-uuid",
    "startTime": "2024-01-15T09:00:00.000Z",
    "endTime": "2024-01-15T10:00:00.000Z",
    "communicationPoints": "Points",
    "customerFeedback": "Feedback",
    "followUpTasks": "Tasks",
    "attachments": [],
    "createdBy": "user-uuid",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z",
    "customer": { ... },
    "visitPlan": {
      "customer": { ... }
    }
  }
]
```

---

### 4.2 获取拜访报告详情

**GET** `/api/visit-reports/:id`

**响应**: 同列表返回

---

### 4.3 创建拜访报告

**POST** `/api/visit-reports`

**请求体**:
```json
{
  "visitPlanId": "plan-uuid",
  "customerId": "customer-uuid",
  "startTime": "2024-01-15T09:00:00.000Z",
  "endTime": "2024-01-15T10:00:00.000Z",
  "communicationPoints": "Points",
  "customerFeedback": "Feedback",
  "followUpTasks": "Tasks",
  "attachments": ["url1", "url2"]
}
```

**响应**: 返回创建的拜访报告对象（包含相关实体）

---

### 4.4 更新拜访报告

**PUT** `/api/visit-reports/:id`

**请求体**: 要更新的字段（可选）

**响应**: 返回更新后的拜访报告对象

---

### 4.5 删除拜访报告

**DELETE** `/api/visit-reports/:id`

**响应**:
```json
{
  "success": true
}
```

---

## 5. 文章接口 (`/api/articles`)

所有接口需要认证。

### 5.1 获取文章列表

**GET** `/api/articles`

**响应**:
```json
[
  {
    "id": "uuid",
    "title": "Article Title",
    "content": "Article Content",
    "createdBy": "user-uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### 5.2 获取文章详情

**GET** `/api/articles/:id`

**响应**: 返回单个文章对象

---

### 5.3 创建文章

**POST** `/api/articles`

**请求体**:
```json
{
  "title": "Article Title",
  "content": "Article Content"
}
```

**响应**: 返回创建的文章对象

---

### 5.4 更新文章

**PUT** `/api/articles/:id`

**请求体**:
```json
{
  "title": "Updated Title",
  "content": "Updated Content"
}
```

**响应**: 返回更新后的文章对象

---

### 5.5 删除文章

**DELETE** `/api/articles/:id`

**响应**:
```json
{
  "success": true
}
```

---

## 6. 邀请接口 (`/api/invitations`)

### 6.1 获取邀请列表（仅管理员）

**GET** `/api/invitations`

**权限**: 需要管理员权限

**响应**:
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "token": "invitation-token",
    "role": "USER",
    "invitedById": "admin-uuid",
    "acceptedAt": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "expiresAt": "2024-01-08T00:00:00.000Z",
    "invitedBy": {
      "id": "admin-uuid",
      "name": "Admin Name",
      "email": "admin@example.com"
    }
  }
]
```

---

### 6.2 验证邀请令牌

**GET** `/api/invitations/verify/:token`

**无需认证**

**响应**:
```json
{
  "valid": true,
  "email": "user@example.com",
  "role": "USER"
}
```

**错误响应**:
- `404` - 邀请令牌无效
- `400` - 邀请已被接受或已过期

---

### 6.3 创建邀请（仅管理员）

**POST** `/api/invitations`

**权限**: 需要管理员权限

**请求体**:
```json
{
  "email": "user@example.com",
  "role": "USER"
}
```

**响应**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "token": "invitation-token",
  "role": "USER",
  "invitedById": "admin-uuid",
  "acceptedAt": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "expiresAt": "2024-01-08T00:00:00.000Z",
  "inviteUrl": "http://localhost:5173/signup?token=invitation-token"
}
```

---

### 6.4 删除邀请（仅管理员）

**DELETE** `/api/invitations/:id`

**权限**: 需要管理员权限

**响应**:
```json
{
  "success": true
}
```

---

## 错误响应格式

所有错误响应遵循以下格式：

```json
{
  "error": "Error message"
}
```

### 常见 HTTP 状态码

- `200` - 成功
- `201` - 创建成功
- `400` - 请求错误（参数错误）
- `401` - 未授权（需要登录）
- `403` - 禁止访问（权限不足）
- `404` - 资源不存在
- `500` - 服务器内部错误

---

## 数据类型

### VisitStatus 枚举

- `PENDING` - 待签到
- `CHECKED_IN` - 已签到
- `COMPLETED` - 已完成
- `CANCELLED` - 已取消

### Role 枚举

- `ADMIN` - 管理员
- `MANAGER` - 经理
- `USER` - 普通用户

---

## 认证中间件

所有需要认证的接口（除 `/api/auth/*` 和 `/api/invitations/verify/*`）都需要在请求头中包含 JWT Token：

```
Authorization: Bearer <token>
```

Token 可以通过登录或注册接口获取，有效期为 7 天（可在环境变量中配置）。

---

## 数据隔离

所有客户、拜访计划、拜访报告数据都按 `createdBy` 字段进行隔离，用户只能访问自己创建的数据（Article 除外，所有用户可查看）。

