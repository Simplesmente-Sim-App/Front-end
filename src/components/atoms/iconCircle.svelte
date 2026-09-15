<script lang="ts">
  let { icon = "", children = () => "" } = $props();
</script>

<div class="icon">
  {icon}
  {@render children?.()}
</div>

<style lang="scss">
.icon {
  width: auto;
  height: auto;
  background: transparent;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}
</style>
