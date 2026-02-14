<script lang="ts">
		let {children = () => "", text="", className = "", ...props} = $props();
</script>

<button class={`btn ${className}`} {...props}>
	{text}
	{@render children?.()}
</button>

<style lang="scss">

.btn {
  background: #c76a75;
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  transition: 0.3s;

  &:hover {
    background: #b85c67;
  }
}
</style>
