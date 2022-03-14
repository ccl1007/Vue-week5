import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.9/vue.esm-browser.js';

createApp({
    data() {
      return {
        user: {
          username: '',
          password: '',
        },
      }
    },
    methods: {
      login() {
        const api = 'https://vue3-course-api.hexschool.io/v2/admin/signin';
        axios.post(api, this.user).then((response) => {
          //定義response中的token, expired timestamp
          const { token, expired } = response.data;
          console.log( token, expired);
          // 寫入 cookie token
          // expires 設置有效時間
          //在登入後台時需要先把 response 回來的 token 存到 Cookie
          document.cookie = `hexToken=${token};expires=${new Date(expired)};`;
          //頁面跳轉至cart.html
          window.location = 'cart.html';
        }).catch((error) => {
          alert(error.data.message);
        });
      },
    }

  }).mount('#app');