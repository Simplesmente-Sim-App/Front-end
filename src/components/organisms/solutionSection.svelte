<script>
  import Container from '../atoms/container.svelte';
  import FeatureItem from '../molecules/featureItem.svelte';

  const features = [
    {
      icon: '💌',
      title: 'Save the Date',
      description: 'Convites digitais com lembretes automáticos.'
    },
    {
      icon: '👥',
      title: 'Lista de Convidados',
      description: 'Confirmação de presença simples e intuitiva.'
    },
    {
      icon: '🎁',
      title: 'Lista de Presentes',
      description: 'Opção de PIX integrado.'
    }
  ];
</script>

<section class="solution">
  <Container>
    <h2>A solução que estamos criando</h2>

    <div class="grid">
      {#each features as feature}
        <FeatureItem {...feature} />
      {/each}
    </div>
  </Container>
</section>

<style lang="scss">
.solution {
  padding: 100px 0;

  h2 {
    text-align: center;
    margin-bottom: 60px;
    font-size: 36px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 30px;
  }
}
</style>
