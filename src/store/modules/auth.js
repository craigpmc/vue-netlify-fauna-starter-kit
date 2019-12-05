
import GoTrue from "gotrue-js";

export const Auth = new GoTrue({
  APIUrl: "https://simple-vue-netlify-auth.netlify.com/.netlify/identity",
  audience: "",
  setCookie: false
});

let saveState = function (key, state) {
  window.localStorage.setItem(key, JSON.stringify(state));
}

export default {
  strict: false,
  namespaced: true,

  state() {
    return {
      testData: "Hello!",
      currentUser:null
    }
  },
  getters: {
    testData: state => state.testData,
    
    // When currentUser has data loggedIn will return true
    loggedIn: state => !!state.currentUser, 

    currentUser: state => state.currentUser,

    authToken: () => "authToken placeholder"
  
  },
  mutations: {
    updateTestData(state, value) {
      state.testData = value
    },
    SET_CURRENT_USER(state, value) {
      state.currentUser = value;
      saveState("auth.currentUser", value)
    }

  },
  actions: {
    sup() {
      console.log("sup")
    },
    
    updateTestDataAction({ commit }, value) {
      commit('updateTestData', value)
    },
    
    attemptLogin({ commit }, credentials) {
      console.log(`attempting login for ${credentials.email}`)

      return new Promise((resolve, reject) => {

        Auth
          .login(credentials.email, credentials.password)
          .then(response => {
            resolve(response)
            commit("SET_CURRENT_USER", response)
          })
          .catch(error => {
            console.log("An error occurred trying to signup", error)
            reject(error)
          })
         
      })

    },

    attemptExternalLogin(){
      console.log("login with external")
      console.log( Auth.loginExternalUrl("Google"))
      window.location.href = Auth.loginExternalUrl("Google");

    },

    completeExternalLogin({commit}, params){
      console.log("completing external login, using params" , params)
      Auth.createUser(params)
        .then(user =>{
          console.log("completed external login" , user)
          commit("SET_CURRENT_USER", user)

        })
        .catch(err => {
          console.log("problem with external login" , err)
        })
       
    },
    
    attemptSignup({ dispatch }, credentials) {
      console.log(`attempting signup for ${credentials.email}...`, credentials)
      return new Promise((resolve, reject) => {
        Auth.signup(credentials.email, credentials.password, { full_name: credentials.name })
          .then(response => {
            dispatch("sup")
            console.log(`Confirmation email sent`, response)
            resolve(response)
          })
          .catch(error => {
            console.log("An error occurred trying to signup", error)
            reject(error)
          })
      })


    },
    
    attemptConfirmation({ dispatch }, token) {
      dispatch("sup")
      console.log("trying to verify token in vuex" , token)
      return new Promise((resolve, reject) => {
        
        Auth
          .confirm(token)
          .then(response => {
            console.log("User has been confirmed")
            resolve(response)
          })
          .catch(error => {
            console.log("An error occurred trying to confirm the user", error)
            reject(error)
          })
      })
    },

    attemptLogout({commit}){
      
      commit("SET_CURRENT_USER", null)
      
      Auth
        .currentUser()
        .logout()
        .then(() => {
          console.log("User logged out")
          alert("you have logged out")
          })
        .catch(error => {
          console.warn("could not log out", error)
          throw error
        })

    },

    updateUserMetaData({state, commit}){
       //TECH DEBT - running this can mutate vuex state directly for some weird reason
       // consider moving this to a server side function            
      Auth.currentUser()
        .update({
            data: {
              dbToken: "hihihi",
              full_name: "Alex Chiu",
              },
        })
        .then((response) => {
          commit("SET_CURRENT_USER", state.currentUser)
          console.log("Updated user")
          console.log(response)

          })
        .catch(error => {
          console.log("Failed to update user: %o", error);

          throw error;
            });
                            
    }
  }
}