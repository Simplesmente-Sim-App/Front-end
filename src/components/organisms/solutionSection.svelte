<script>
	import { Bell, Camera, LayoutGrid, UserCheck, Users, Wallet } from '@lucide/svelte';
  import Container from '../atoms/container.svelte';
  import FeatureItem from '../molecules/featureItem.svelte';

  const features = [
    {
      Icon: Bell,
      title: 'Save the Date',
      description: 'Convites digitais com lembretes automáticos.'
    },
    {
      Icon: Users,
      title: 'Lista de Convidados',
      description: 'Organize sua lista de convidados com facilidade.'
    },
    {
      Icon: UserCheck,
      title: 'Confirmação de Presença',
      description: 'Confirmação de presença simples e intuitiva por whatsapp ou email.'
    },
    {
      Icon: LayoutGrid,
      title: 'Organização de Mesas',
      description: 'Distribua seus convidados nas mesas de forma visual e intuitiva.'
    },
    {
      Icon: Wallet,
      title: 'Lista de Presentes',
      description: 'Controle de presentes e opção de PIX integrado.'
    },
    {
      Icon: Camera,
      title: 'Galeria Compartilhada',
      description: 'Todas as fotos da festa reunidas em um só álbum digital'
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
