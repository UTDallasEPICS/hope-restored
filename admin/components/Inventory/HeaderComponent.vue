
  <!-- components/HeaderComponent.vue -->
  <template>
    <header>
      <nav class="navbar">
          <ul>
          <li class="title">Hope Restored Missions</li>
          <li><nuxt-link to="/Home">Home</nuxt-link></li>
          <li><nuxt-link to="/reports">Reports</nuxt-link></li>
          <li><nuxt-link to="/inventory">Inventory</nuxt-link></li>
          <li><nuxt-link to="/checkout">Checkout</nuxt-link></li>  

          
        </ul>
        <hr>
      </nav>
    </header>
  </template>
  
  <script>
  export default {
    name: 'HeaderComponent',
  };
  </script>
  
  <style scoped>
  /* Add styles for your header here */
    @import url('https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Figtree:ital,wght@0,300..900;1,300..900&family=Quicksand:wght@600&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Figtree:ital,wght@0,300..900;1,300..900&family=Oswald:wght@200..700&family=Quicksand:wght@600&display=swap');
    nav {
    padding: 1rem;
    }
  
  
    ul {
    list-style: none;
    padding:0%;
    /* Remove default padding */
    }
  
    li {
    display: inline;
    margin-left: 10px;
    margin-right: 15px;
    font-family: 'sans-serif', Arial;
    padding-bottom: 0%;
    font-size: 25px;
    font-weight: 700;
    }
  
    a {
    color: #878787;
    text-decoration: none;
    }
  
    a.router-link-active,
    a.router-link-exact-active {
    color: #000000;
    }
  
    .title {
      font-family: 'sans-serif', Arial;
      font-size: 30px;
      margin-left:0%;
      margin-right: 60px;
      color: #878787;
    }
  </style>
  