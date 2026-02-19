<script>
  let { Icon, description } = $props();
</script>

<div class="feature">
   {#if Icon} 
    <div class="icon">
      <Icon color="rgba(209, 148, 158, 1)" />
    </div>
   {/if}
  <p>{description}</p>
</div>

<style lang="scss">
.feature {
  text-align: left;
  display: flex;
  flex-direction: row;
  gap: 20px;
  align-items: center;
  padding: 30px;
  background: rgb(250, 247, 245);
  border-radius: 16px;
  border: 1px solid rgba(231, 224, 218, 0.5);
  transition: all 0.3s ease;

  .icon {
    background-color: rgba(209, 148, 158, 0.15);
    border-radius: 9999px;
    padding: 12px;
    justify-content: center;
    align-items: center;
    display: flex;
  }
  &:hover {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    scale: 1.05;
  }

  h3 {
    margin-top: 16px;
    margin-bottom: 8px;
  }

  p {
    color: #7a6a6a;
    font-weight: 600;

  }
}
</style>
