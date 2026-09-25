import styles from './TandemGrid.module.css';

export default function TandemGrid({ board, selectedIndex, wrongFlash, correctFlash, missedIndices = [], onCellClick, locked }) {
  return (
    <div className={styles.boardFrame}>
      <div className={styles.grid}>
        {board.map((cell, i) => {
          const isEmpty = !cell;
          const isSelected = selectedIndex === i;
          const isWrong = wrongFlash.includes(i);
          const isMatched = correctFlash.includes(i);
          const isMissed = missedIndices.includes(i);
          const label = isEmpty ? 'empty slot' : cell.word;
          return (
            <button
              key={i}
              type="button"
              className={[
                styles.cell,
                isSelected ? styles.selected : '',
                isWrong ? styles.wrong : '',
                isMatched ? styles.matched : '',
                isMissed ? styles.missed : '',
                isEmpty ? styles.empty : '',
              ].filter(Boolean).join(' ')}
              onClick={() => onCellClick(i)}
              disabled={locked || isEmpty}
              aria-label={isMissed ? `${label}, a pair you missed` : label}
            >
              {cell ? cell.word : ''}
            </button>
          );
        })}
      </div>
    </div>
  );
}
