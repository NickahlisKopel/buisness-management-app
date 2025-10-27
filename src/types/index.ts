import { User, FuneralHome, FuneralProduct, Supplier, Order, OrderItem, OrderStatus, UserRole, Ceremony, CeremonyStatus } from '@prisma/client'

export type { User, FuneralHome, FuneralProduct, Supplier, Order, OrderItem, OrderStatus, UserRole, Ceremony, CeremonyStatus }

// Extended types with relations
export type FuneralHomeWithOrders = FuneralHome & {
  orders: Order[]
}

export type ProductWithSuppliers = FuneralProduct & {
  supplierProducts: Array<{
    id: string
    supplierId: string
    productId: string
    supplierSku: string | null
    price: number
    isActive: boolean
    supplier: Supplier
  }>
}

export type OrderWithDetails = Order & {
  funeralHome: FuneralHome
  supplier: Supplier
  orderItems: Array<{
    id: string
    orderId: string
    productId: string
    quantity: number
    unitPrice: number
    total: number
    product: FuneralProduct
  }>
}

export type OrderItemWithProduct = OrderItem & {
  product: FuneralProduct
}

// Form types
export interface CreateFuneralHomeData {
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  phone?: string
  email?: string
  director?: string
  capacity?: number
}

export interface CreateProductData {
  name: string
  sku: string
  description?: string
  category: string
  price: number
  cost: number
  inventory: number
  minStock: number
}

export interface CreateSupplierData {
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  contactPerson?: string
  notes?: string
}

export interface CreateCeremonyData {
  funeralHomeId: string
  deceasedName: string
  familyContact: string
  ceremonyDate: string
  ceremonyType: string
  status?: CeremonyStatus
  notes?: string
}

export interface CreateOrderData {
  funeralHomeId: string
  supplierId: string
  notes?: string
  orderItems: Array<{
    productId: string
    quantity: number
    unitPrice: number
  }>
}

// Grid ordering types
export interface OrderGridRow {
  productId: string
  productName: string
  supplierSku?: string
  quantity: number
  unitPrice: number
  total: number
}

export interface OrderGridData {
  supplierId: string
  funeralHomeId: string
  rows: OrderGridRow[]
  notes?: string
}
