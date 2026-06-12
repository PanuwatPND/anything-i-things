/**
 * ข้อมูลสต็อก + ตะกร้าแบบ local (ต่อไปแทนที่ด้วย Go API ได้จากจุดเดียว)
 */
type DrinkItem = {
  id: string
  name: string
  price: number
  stock: number
  image: string
  bottlesPerPack: number
}

type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
}

const INVENTORY_STORAGE_KEY = 'watershop-inventory'
const CART_STORAGE_KEY = 'watershop-cart'

/** เมนูมาตรฐาน — อ้างอิง id เดียวกับ localStorage / UI */
export const WATER_CATALOG: DrinkItem[] = [
  {
    id: 'water-600ml',
    name: 'น้ำดื่ม 600 ml',
    price: 35,
    stock: 60,
    image: '/products/water-bottle.png',
    bottlesPerPack: 6,
  },
  {
    id: 'water-1500ml',
    name: 'น้ำดื่ม 1500 ml',
    price: 35,
    stock: 60,
    image: '/products/water-bottle.png',
    bottlesPerPack: 6,
  },
]

const cloneCatalog = (): DrinkItem[] => WATER_CATALOG.map((row) => ({ ...row }))
const ALLOWED_IDS = new Set(WATER_CATALOG.map((item) => item.id))

const getPackPrice = (quantity: number) => {
  const safeQuantity = Math.max(1, Math.trunc(quantity))
  const packOfThree = Math.floor(safeQuantity / 3)
  const remaining = safeQuantity % 3
  return packOfThree * 100 + remaining * 35
}

export const useLocalWatershop = () => {
  const items = useState<DrinkItem[]>('watershop-catalog', () => cloneCatalog())
  const cartItems = useState<CartItem[]>('watershop-cart-items', () => [])

  const persistInventory = () => {
    if (!import.meta.client) return
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items.value))
  }

  const persistCart = () => {
    if (!import.meta.client) return
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems.value))
  }

  const hydrateInventory = () => {
    if (!import.meta.client) return

    const resetToDefault = () => {
      items.value = cloneCatalog()
      persistInventory()
    }

    const raw = localStorage.getItem(INVENTORY_STORAGE_KEY)
    if (!raw) {
      resetToDefault()
      return
    }

    try {
      const parsed = JSON.parse(raw) as unknown
      if (!Array.isArray(parsed)) {
        resetToDefault()
        return
      }

      const sanitized = parsed
        .filter(
          (entry): entry is DrinkItem =>
            typeof entry === 'object' &&
            entry !== null &&
            'id' in entry &&
            'name' in entry &&
            'stock' in entry &&
            typeof (entry as DrinkItem).id === 'string' &&
            typeof (entry as DrinkItem).name === 'string' &&
            typeof (entry as DrinkItem).stock === 'number',
        )
        .filter((entry) => ALLOWED_IDS.has(entry.id))
        .map((entry) => {
          const def = WATER_CATALOG.find((d) => d.id === entry.id)!
          return {
            ...def,
            ...entry,
            price: 35,
            stock: Math.max(0, Math.trunc(entry.stock)),
            image: def.image,
            bottlesPerPack: def.bottlesPerPack,
          }
        })

      if (sanitized.length !== WATER_CATALOG.length) {
        resetToDefault()
        return
      }

      items.value = sanitized
    } catch {
      resetToDefault()
    }

    if (items.value.length === 0) {
      items.value = cloneCatalog()
      persistInventory()
    }
  }

  const hydrateCart = () => {
    if (!import.meta.client) return
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    cartItems.value = raw ? (JSON.parse(raw) as CartItem[]) : []
  }

  const hydrateShop = () => {
    hydrateInventory()
    hydrateCart()
  }

  /** บังคับให้มี 2 รายการตาม WATER_CATALOG (กัน state / payload ว่างหรือขาด id) */
  const ensureCatalog = () => {
    hydrateInventory()
    const ids = new Set(items.value.map((i) => i.id))
    const missing = WATER_CATALOG.filter((d) => !ids.has(d.id))
    if (items.value.length === 0 || missing.length > 0) {
      const byId = new Map<string, DrinkItem>()
      for (const d of WATER_CATALOG) {
        byId.set(d.id, { ...d })
      }
      for (const cur of items.value) {
        if (ALLOWED_IDS.has(cur.id)) {
          const def = WATER_CATALOG.find((d) => d.id === cur.id)!
          byId.set(cur.id, {
            ...def,
            ...cur,
            price: 35,
            stock: Math.max(0, Math.trunc(cur.stock)),
            image: def.image,
            bottlesPerPack: def.bottlesPerPack,
          })
        }
      }
      items.value = WATER_CATALOG.map((d) => byId.get(d.id) ?? { ...d })
      persistInventory()
    }
  }

  const resetInventory = () => {
    items.value = cloneCatalog()
    persistInventory()
  }

  const updateStock = (id: string, nextStock: number) => {
    items.value = items.value.map((item) =>
      item.id === id ? { ...item, stock: Math.max(0, Math.trunc(nextStock)) } : item,
    )
    persistInventory()
  }

  const placeOrder = (id: string, quantity: number) => {
    const safeQuantity = Math.max(1, Math.trunc(quantity))
    const target = items.value.find((item) => item.id === id)

    if (!target) throw new Error('ไม่พบสินค้าที่เลือก')
    if (target.stock < safeQuantity) throw new Error('สต็อกไม่พอสำหรับจำนวนที่สั่ง')

    updateStock(id, target.stock - safeQuantity)

    return {
      itemName: target.name,
      amount: getPackPrice(safeQuantity),
    }
  }

  const addItem = (item: Omit<CartItem, 'quantity'>, quantity: number) => {
    const safeQuantity = Math.max(1, Math.trunc(quantity))
    const existing = cartItems.value.find((cartItem) => cartItem.id === item.id)

    if (existing) {
      existing.quantity += safeQuantity
    } else {
      cartItems.value.push({ ...item, quantity: safeQuantity })
    }

    persistCart()
  }

  const updateQuantity = (id: string, quantity: number) => {
    const safeQuantity = Math.max(1, Math.trunc(quantity))
    cartItems.value = cartItems.value.map((item) =>
      item.id === id ? { ...item, quantity: safeQuantity } : item,
    )
    persistCart()
  }

  const removeItem = (id: string) => {
    cartItems.value = cartItems.value.filter((item) => item.id !== id)
    persistCart()
  }

  const clearCart = () => {
    cartItems.value = []
    persistCart()
  }

  /** จำนวน "รายการ" (เส้น) ในตะกร้า — สินค้าเดียวกันนับเป็น 1 */
  const totalCount = computed(() => cartItems.value.length)
  /** รวมจำนวนแพ็ค/ชิ้นในตะกร้า (ผลรวมของ quantity ทุกแถว) */
  const totalBottles = computed(() =>
    cartItems.value.reduce((sum, item) => sum + item.quantity, 0),
  )
  const totalAmount = computed(() => getPackPrice(totalBottles.value))

  return {
    items,
    cartItems,
    hydrateInventory,
    hydrateCart,
    hydrateShop,
    ensureCatalog,
    resetInventory,
    updateStock,
    placeOrder,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    totalCount,
    totalBottles,
    totalAmount,
  }
}
