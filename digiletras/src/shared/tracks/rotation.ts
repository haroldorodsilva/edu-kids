/**
 * Motor de rotação de jogos — função pura.
 *
 * Seleciona o próximo tipo de jogo para uma lição, evitando repetição.
 * Não acessa localStorage nem produz efeitos colaterais.
 */

/**
 * Seleciona o próximo tipo de jogo, priorizando tipos não jogados recentemente.
 *
 * Algoritmo:
 * 1. Limita `recentGames` aos últimos `maxHistory` itens
 * 2. Filtra `availableTypes` removendo os que aparecem no histórico recente
 * 3. Se há tipos não jogados, escolhe um aleatoriamente
 * 4. Se todos foram jogados, reinicia o ciclo — escolhe aleatoriamente entre
 *    todos os disponíveis, tentando evitar o mais recente
 * 5. Se só há 1 tipo disponível, retorna esse tipo
 *
 * @param availableTypes - Tipos de jogo disponíveis para a lição
 * @param recentGames   - Histórico dos últimos jogos (mais recente primeiro)
 * @param maxHistory    - Tamanho máximo do histórico a considerar (default 5)
 * @returns Um tipo de jogo de `availableTypes`
 */
export function selectNextGame(
  availableTypes: string[],
  recentGames: string[],
  maxHistory: number = 5,
): string {
  // Caso trivial: apenas 1 tipo disponível
  if (availableTypes.length <= 1) {
    return availableTypes[0];
  }

  // Considerar apenas os últimos maxHistory jogos
  const recent = recentGames.slice(0, maxHistory);

  // Encontrar tipos que NÃO foram jogados recentemente
  const recentSet = new Set(recent);
  const unplayed = availableTypes.filter((t) => !recentSet.has(t));

  if (unplayed.length > 0) {
    // Escolher aleatoriamente entre os não jogados
    return unplayed[Math.floor(Math.random() * unplayed.length)];
  }

  // Todos os tipos foram jogados recentemente — reiniciar ciclo
  // Tentar evitar o jogo mais recente
  const mostRecent = recent[0];
  const others = availableTypes.filter((t) => t !== mostRecent);

  if (others.length > 0) {
    return others[Math.floor(Math.random() * others.length)];
  }

  // Fallback: selecionar aleatoriamente entre todos
  return availableTypes[Math.floor(Math.random() * availableTypes.length)];
}
