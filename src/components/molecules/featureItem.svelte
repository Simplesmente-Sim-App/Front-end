<script>
  import IconCircle from '../atoms/iconCircle.svelte';

  let { Icon, title, description } = $props();
</script>

<div class="feature">
  <div class="icon">
    <Icon color="rgba(209, 148, 158, 1)" />
  </div>
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

    .icon {
      background-color: rgba(209, 148, 158, 0.15);
      border-radius: 20px;
      padding: 12px;
      justify-content: center;
      align-items: center;
      display: flex;
    }

  h3 {
    margin-top: 16px;
    margin-bottom: 8px;
  }

  p {
    color: #7a6a6a;
  }
}
</style>
