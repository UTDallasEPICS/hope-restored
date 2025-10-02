
  <!-- components/HeaderComponent.vue -->
  <template>
    <header>
      <nav class="navbar">
          <!-- <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrkEWxs5zaMTeYj-qwtpxMkFhJtT4yieFiuQ&s" style="width:170px; height:auto;"> -->
          <ul>
          <li class="title">Hope Restored Missions</li>
          <li><nuxt-link to="/Home">Home</nuxt-link></li>
          <li><nuxt-link to="/inventory">Inventory</nuxt-link></li>
          <li><nuxt-link to="/scanner">Scanner</nuxt-link></li>
          <li><nuxt-link to="/reports">Reports</nuxt-link></li>
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
    text-align: left;
    font-family: "Oswald";
    padding-bottom: 0%;
    font-size: 20px;
    }
  
    a {
    color: #878787;
    text-decoration: none;
    }
  
    .title {
      font-family: 'Oswald';
      font-size: 30px;
      margin-left:0%;
      margin-right: 60px;
      color: #878787;
    }
  </style>
  