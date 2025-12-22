# Backend Endpoints Required for Settings Page

## 1. Settings Endpoints

### GET Settings
```
GET /api/settings/get-settings/:admin_id
Response: {
  success: true,
  data: {
    id: number,
    admin_id: string,
    admin_name: string,
    type_1: string,
    type_1_amount: number,
    grace_amount: number,
    type_2: string,
    grace_amount_type2: number,
    advance_payment_enabled: boolean,
    advanced_payment: number
  }
}
```

### POST/PUT Settings
```
POST /api/settings/upsert-settings/:admin_id
Body: {
  admin_name: string,
  type_1: string,
  type_1_amount: number,
  grace_amount: number,
  type_2: string,
  grace_amount_type2: number,
  advance_payment_enabled: boolean,
  advanced_payment: number
}
Response: {
  success: true,
  message: "Settings updated successfully"
}
```

## 2. Printer Endpoints

### GET Printer Settings
```
GET /api/printer/get-printer/:admin_id
Response: {
  success: true,
  data: {
    id: number,
    admin_id: string,
    heading1: string,
    heading2: string,
    info1: string,
    info2: string,
    note: string,
    hall_name: string,
    logo_url: string
  }
}
```

### POST Printer Settings
```
POST /api/printer/upsert-printer/:admin_id
Body: {
  heading1: string,
  heading2: string,
  info1: string,
  info2: string,
  note: string,
  hall_name: string,
  logo_url: string
}
Response: {
  success: true,
  message: "Printer settings updated successfully"
}
```

## 3. Type2 Amount Endpoints

### GET Type2 Amounts
```
GET /api/type2-amount/get-amounts/:admin_id
Response: {
  success: true,
  data: [
    { id: number, setting_id: number, min_duration: 1, max_duration: 3, amount: number },
    { id: number, setting_id: number, min_duration: 1, max_duration: 6, amount: number },
    { id: number, setting_id: number, min_duration: 1, max_duration: 12, amount: number },
    { id: number, setting_id: number, min_duration: 1, max_duration: 24, amount: number }
  ]
}
```

### POST Type2 Amounts
```
POST /api/type2-amount/upsert-amounts/:admin_id
Body: {
  amounts: [
    { min_duration: 1, max_duration: 3, amount: number },
    { min_duration: 1, max_duration: 6, amount: number },
    { min_duration: 1, max_duration: 12, amount: number },
    { min_duration: 1, max_duration: 24, amount: number }
  ]
}
Response: {
  success: true,
  message: "Type2 amounts updated successfully"
}
```

## Database Tables

### `settings` table
- id (PK)
- admin_id (FK)
- admin_name
- type_1
- type_1_amount
- grace_amount
- type_2
- grace_amount_type2
- advance_payment_enabled
- advanced_payment

### `printer` table
- id (PK)
- admin_id (FK)
- heading1
- heading2
- info1
- info2
- note
- hall_name
- logo_url

### `type2_amount` table
- id (PK)
- setting_id (FK references settings.id)
- min_duration
- max_duration
- amount
