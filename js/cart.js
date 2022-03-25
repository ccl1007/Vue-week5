/* global axios bootstrap VeeValidate VeeValidateRules VeeValidateI18n */
const apiUrl = 'https://vue3-course-api.hexschool.io/v2'
const apiPath = 'luku612150'

// 宣告VeeValidate工具、規則、多國語系
const { defineRule, Form, Field, ErrorMessage, configure } = VeeValidate
const { required, email, min, max } = VeeValidateRules
const { localize, loadLocaleFromURL } = VeeValidateI18n

defineRule('required', required)
defineRule('email', email)
defineRule('min', min)
defineRule('max', max)
// 引入中文化
loadLocaleFromURL('https://unpkg.com/@vee-validate/i18n@4.1.0/dist/locale/zh_TW.json')

configure({ // for啟用哪些設定
  generateMessage: localize('zh_TW'), // 啟用 locale
  validateOnInput: true // 輸入文字時，就立即進行驗證
})

// eslint-disable-next-line no-undef
const app = Vue.createApp({
  data () {
    return {
      // 購物車列表
      // 建置物件內第二層carts，於渲染畫面時才不會報錯
      // 或是使用可選串聯?.
      cartData: {
        carts: []
      },
      // 產品列表
      products: [],
      productId: '',
      isLoadingItem: '',
      form: {
        user: {
          name: '',
          email: '',
          tel: '',
          address: ''
        },
        message: ''
      }
    }
  },
  components: {
    VForm: Form,
    VField: Field,
    ErrorMessage: ErrorMessage
  },
  methods: {
    // 1.取得產品列表
    getProducts () {
      axios.get(`${apiUrl}/api/${apiPath}/products/all`).then((res) => {
        console.log(res)
        this.products = res.data.products
      }).catch((err) => {
        alert(err.data.message)
      })
    },
    // 10.從外層直接操作內層productModal元件
    openProductModal (id) {
      this.productId = id
      this.$refs.productModal.openModal()
    },
    // 13.取得購物車列表
    getCart () {
      axios.get(`${apiUrl}/api/${apiPath}/cart`).then((res) => {
        console.log(res)
        this.cartData = res.data.data
      }).catch((err) => {
        alert(err.data.message)
      })
    },
    // 14.加入購物車
    // qty = 1 預設值為1
    addToCart (id, qty = 1) {
      const data = {
        product_id: id,
        qty
      }
      // 15.加入Loading效果
      this.isLoadingItem = id
      axios.post(`${apiUrl}/api/${apiPath}/cart`, { data }).then((res) => {
        console.log(res)
        this.getCart()
        // addToCart後關掉Modal
        this.$refs.productModal.closeModal()
        // 將isLoading效果清除
        this.isLoadingItem = ''
      }).catch((err) => {
        alert(err.data.message)
      })
    },
    // 16.刪除特定品項
    removeCartItem (id) {
      this.isLoadingItem = id
      axios.delete(`${apiUrl}/api/${apiPath}/cart/${id}`).then((res) => {
        console.log(res)
        this.getCart()
        this.isLoadingItem = ''
      }).catch((err) => {
        alert(err.data.message)
      })
    },
    // 17.更新購物車數量
    updateCartItem (item) {
      const data = {
        product_id: item.id,
        qty: item.qty
      }
      this.isLoadingItem = item.id
      axios.put(`${apiUrl}/api/${apiPath}/cart/${item.id}`, { data }).then((res) => {
        console.log(res)
        this.getCart()
        this.isLoadingItem = ''
      }).catch((err) => {
        alert(err.data.message)
      })
    },
    // 18.清空購物車
    deleteCart () {
      axios.delete(`${apiUrl}/api/${apiPath}/carts`).then((res) => {
        console.log(res)
        this.cartData = {
          carts: []
        }
      }).catch((err) => {
        alert(err.data.message)
      })
    },
    // 19.新增訂單
    createOrder () {
      const order = this.form
      axios.post(`${apiUrl}/api/${apiPath}/order`, { data: order }).then((res) => {
        console.log(res)
        alert(res.data.message)
        // 重設表單
        this.$refs.form.resetForm()
        this.form.message = ''
        this.getCart()
      }).catch((err) => {
        alert(err.data.message)
      })
    }
  },
  mounted () {
    this.getProducts()
    this.getCart()
  }
})

// $refs
// 6.全域註冊 product-modal 的元件
app.component('product-modal', {
  props: ['id'],
  template: '#userProductModal',
  data () {
    return {
      // 9.定義modal才會是在同一個作用域
      modal: {},
      product: {},
      qty: 1
    }
  },
  // 12.監聽id有變動時觸發getProduct()
  watch: {
    id () {
      this.getProduct()
    }
  },
  methods: {
    openModal () {
      this.modal.show()
      this.qty = ''
    },
    closeModal () {
      this.modal.hide()
    },
    // 11.元件內取得product 資料
    getProduct () {
      axios.get(`${apiUrl}/api/${apiPath}/product/${this.id}`).then((res) => {
        this.product = res.data.product
      }).catch((err) => {
        alert(err.data.message)
      })
    },
    // $emit方式從元件內向外傳出參數productid及qty
    addToCart () {
      this.$emit('add-cart', this.product.id, this.qty)
    }
  },
  mounted () {
    // 8.以$refs方式取得子元件中的modal
    this.modal = new bootstrap.Modal(this.$refs.modal)
  }
})

app.mount('#app')
