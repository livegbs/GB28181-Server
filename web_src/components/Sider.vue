<template>
  <aside id="slider" class="main-sidebar">
    <section class="sidebar">
      <ul class="sidebar-menu">
        <template v-for="(item,index) in menus">
          <router-link class="treeview" :key="index" :to="item.path" tag="li" :exact="item.path == '/'">
            <a>
              <i :class="['fa', 'fa-' + item.icon]"></i>
              <span>{{item.title}}</span>           
            </a>
          </router-link>
        </template>
      </ul>
    </section>
  </aside>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  props: {
    menus : {
        default : () => []
    }
  },
  computed: {
     ...mapState(['userInfo', 'serverInfo']),
    path(){
      return location.pathname;
    }
  },
  methods: {
    ...mapActions(["getServerInfo"])
  }
}

</script>

<style lang="css" scoped="true">
  .main-sidebar{
  /* Fix for IE */
  -webkit-transition: none;
  -o-transition: none;
  transition: none;
}
</style>

