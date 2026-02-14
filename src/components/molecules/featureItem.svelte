<script>
  import IconCircle from '../atoms/iconCircle.svelte';

  let { icon, title, description } = $props();
</script>

<div class="feature">
  <IconCircle {icon} />
  <h3>{title}</h3>
  <p>{description}</p>
</div>

<style lang="scss">
.feature {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);

  h3 {
    margin-top: 16px;
    margin-bottom: 8px;
  }

  p {
    color: #7a6a6a;
  }
}
</style>
