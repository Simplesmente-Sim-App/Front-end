<script>
  import Container from '../atoms/container.svelte';
  import FeatureItem from '../molecules/featureItem.svelte';
	import IssuesItem from '../molecules/issuesItem.svelte';

  const issues = [
    {
      icon: '💌',
      description: 'Confirmação de presença pelo WhatsApp'
    },
    {
      icon: '👥',
      description: 'Lista de convidados desorganizada'
    },
    {
      icon: '🎁',
      title: 'Lista de Presentes',
      description: 'Dificuldade para organizar mesas'
    },
    {
      icon: '🎁',
      description: 'Fotos espalhadas entre os convidados'
    },
    {
      icon: '🎁',
      description: 'Lista de presentes confusa'
    }
  ];
</script>

<section class="solution">
  <Container>
    <h2>A solução que estamos criando</h2>

    <div class="grid">
      {#each issues as issue}
        <IssuesItem {...issue} />
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
