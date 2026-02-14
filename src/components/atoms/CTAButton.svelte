<script>
	import { Heart } from "@lucide/svelte";

  let {children = () => "", href = "#pesquisa", text = "Responder pesquisa (5 minutos)", ...props} = $props();
</script>

<a {href} class="cta-button">
  <Heart size="20" color="white" class="icon"/>
  {text}
</a>

<style lang="scss">
  .cta-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.125rem;
    padding: 0.75rem 1.5rem;
    background-image: linear-gradient(135deg, hsl(350 45% 65%) 0%, hsl(350 50% 58%) 100%);
    box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px;
    color: white;
    text-decoration: none;
    border-radius: 1.5rem;
    font-weight: 500;
    transition: all 0.3s ease;
    cursor: pointer;

    .icon {
      width: 1.25rem;
      height: 1.25rem;
      flex-shrink: 0;
    }

    &:hover {
      background-color: #ce5065;
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    &:focus {
      outline: 2px solid #ce5065;
      outline-offset: 2px;
    }
  }
</style>