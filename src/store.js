import Vue from 'vue'
import Vuex from 'vuex'
import axios from './axios-auth'
import globalAxios from 'axios'
import router from './router'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    idToken: null,
    userId: null,
    user: null
  },
  mutations: {
    authUser(state, userData) {
      state.idToken = userData.token;
      state.userId = userData.userId;
    },
    storeUser(state, user) {
      state.user = user
    },
    clearAuthData(state){
      state.idToken = null;
      state.userId = null;
    }
  },
  actions: {
    setLogoutTimer({commit},exTime){
      setTimeout(()=>{
        commit('clearAuthData');
      },exTime * 10)
    },

    signUp({commit, dispatch}, authData) {
      axios.post('accounts:signUp?key=AIzaSyBvvGD5r9sWZ1OMuhtCNfFzzPrelEs5gaw', {
        email: authData.email,
        password: authData.password,
        returnSecureToken: true
      })
        .then(response => {
          console.log('signUp actions');
          commit('authUser', {
            token: response.data.idToken,
            userId: response.data.localId
          });

          const now = new Date();
          const expDate = Date(now.getTime()+ response.data.expiresIn * 10000);
          localStorage.setItem('token', response.data.idToken);
          localStorage.setItem('userToken', response.data.localId);
          localStorage.setItem('expTime', expDate);

          dispatch('storeUser', authData);
          dispatch('setLogoutTimer',response.data.expiresIn);
        })
        .catch(error => {
        });
    },
    logIn({commit, dispatch}, authData) {
      axios.post('accounts:signInWithPassword?key=AIzaSyBvvGD5r9sWZ1OMuhtCNfFzzPrelEs5gaw', {
        email: authData.email,
        password: authData.password,
        returnSecureToken: true
      })
        .then(response => {
          console.log('logIn user:', response);
          commit('authUser', {
            token: response.data.idToken,
            userId: response.data.localId
          });

          const now = new Date();
          const expDate = new Date(now.getTime() + response.data.expiresIn * 10);
          localStorage.setItem('token', response.data.idToken);
          localStorage.setItem('userToken', response.data.localId);
          localStorage.setItem('expTime', expDate);

          dispatch('fetchUser', authData);
          dispatch('setLogoutTimer',response.data.expiresIn);
        })
        .catch(error => {
          console.log('ERROR: ', error)
        });
    },
    logOut({commit}){
      router.replace('/signin');
      localStorage.removeItem('token');
      localStorage.removeItem('userToken');
      localStorage.removeItem('expTime');
      commit('clearAuthData');
    },
    storeUser({commit, state}, user) {
      if (!state.idToken) {
        return
      }
      globalAxios.post('/users.json?auth=' + state.idToken, user)
        .then(response => {})
        .catch(error => {
          console.log('ERROR: ', error)
        });
    },
    fetchUser({commit,state},authData) {
      if (!state.idToken) {
        return
      }
      globalAxios.get('/users.json?auth=' + state.idToken)
        .then(res => {
          const data = res.data; // создаем массив data
          let users = [];
          for (let key in data) { // key - зашифрованный объект в объекте data
            const user = data[key]; //в user запихиваем то, что хранится в зашифрованном объекте
            user.id = key; //добавляем значение криптоключа как id пользователя
            users.push(user); // добавляем пользователя в массив пользователей
          }
          for (let user of users){
            if (user.email == authData.email){
              commit('storeUser', user);
            }
          }
        })
        .catch(error => {console.log(error)})
    },
    autoLogin({commit, dispatch}){
      const token = localStorage.getItem('token');
      if (!token){
        return;
      }else{
        let expDate = new Date(localStorage.getItem('expTime'));
        const now = new Date();
        console.log('expDate = ',expDate);
        console.log('now = ',now);

        if (now >= expDate) {
          return;
        }
        const userToken = localStorage.getItem('userToken');
        commit('authUser',{token: token, userId: userToken})
      }
    }
  },
  getters: {
    user(state) {
      return state.user;
    },
    isAuthenticated(state){
      return state.idToken !== null
    }
  }
})
