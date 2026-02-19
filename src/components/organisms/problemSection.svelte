<script>
	import { Gift, Image, LayoutGrid, MessageCircle, Users } from '@lucide/svelte';
  import Container from '../atoms/container.svelte';
	import IssuesItem from '../molecules/issuesItem.svelte';

  const issues = [
    {
      Icon: MessageCircle,
      description: 'Confirmação de presença pelo WhatsApp'
    },
    {
      Icon: Users,
      description: 'Lista de convidados desorganizada'
    },
    {
      Icon: LayoutGrid,
      title: 'Lista de Presentes',
      description: 'Dificuldade para organizar mesas'
    },
    {
      Icon: Image,
      description: 'Fotos espalhadas entre os convidados'
    },
    {
      Icon: Gift,
      description: 'Lista de presentes confusa'
    }
  ];
</script>

<section class="solution">
  <Container>
    <div class="header">
      <h2>Você já passou por isso?</h2>
      <p>Organizar um casamento deveria ser especial, não estressante.</p>
    </div>

    <div class="flex">
      {#each issues as issue}
        <IssuesItem {...issue} />
      {/each}
    </div>
  </Container>
</section>

<style lang="scss">
.solution {
  padding: 100px 0;

  .header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 60px;
  }

  h2 {
    text-align: center;
    margin-bottom: 10px;
    font-size: 36px;
  }

  p {
    text-align: center;
    font-size: 18px;
  }

  .flex {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    gap: 30px;
    justify-content: center;
  }
}
</style>
