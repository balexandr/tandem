import styles from './TandemGrid.module.css';

export default function TandemGrid({ board, selectedIndex, wrongFlash, correctFlash, onCellClick, locked }) {
  return (
    <div className={styles.boardFrame}>
      <div className={styles.grid}>
        {board.map((cell, i) => {
          const isEmpty = !cell;
          const isSelected = selectedIndex === i;
          const isWrong = wrongFlash.includes(i);
          const isMatched = correctFlash.includes(i);
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
                isEmpty ? styles.empty : '',
              ].filter(Boolean).join(' ')}
              onClick={() => onCellClick(i)}
              disabled={locked || isEmpty}
              aria-label={label}
            >
              {cell ? cell.word : ''}
            </button>
          );
        })}
      </div>
    </div>
  );
}
