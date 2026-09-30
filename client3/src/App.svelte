<script lang="ts">
  import { ToastContainer } from 'svelte-toastify'
  import AppLoader from "./modules/AppLoader.svelte";
  import SimpleLayout from "./modules/layout/SimpleLayout.svelte";
</script>

<AppLoader>
  <SimpleLayout />
</AppLoader>
<ToastContainer />
