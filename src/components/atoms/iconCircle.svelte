<script lang="ts">
  let { icon = "", children = () => "" } = $props();
</script>

<div class="icon">
  {icon}
  {@render children?.()}
</div>

<style lang="scss">
.icon {
  width: 60px;
  height: 60px;
  background: rgba(#c76a75, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}
</style>
