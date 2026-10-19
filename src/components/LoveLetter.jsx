export default function LoveLetter({ visible, letterRef, onClose }) {
  return (
          <article className="love-letter" id="love-letter" hidden={!visible} ref={letterRef} tabIndex={-1}>
            <span className="letter-date">SEBUAH SURAT KECIL, DI HARI SPESIALMU</span>
            <h3>Dear Cenat Cenut Cinut,</h3>
            <p>Selamat ulang tahun, sayang, baebao, cinta, honey, sweetheart, my lovely cinutsss.</p>
            <p>Hari ini aku cuma mau bilang: aku senang kamu ada. Senang bisa kenal kamu, dekat sama kamu, dan punya kesempatan buat sayang sama kamu.</p>
            <p>Di umur yang baru ini, semoga hal-hal yang lagi kamu usahakan pelan-pelan ketemu jalannya. Semoga kamu punya banyak alasan buat ketawa, tidur yang nyenyak, dan hari-hari yang terasa lebih ringan.</p>
            <p>Kalau nanti ada hari yang capek, kamu nggak harus selalu kuat. Cerita aja. Aku mau dengar, bahkan kalau ceritanya cuma tentang hal kecil yang bikin kamu bete hari itu.</p>
            <p>Terima kasih sudah jadi kamu. Yang gemas, yang kadang nyebelin karna suka betee, yang tetap jadi orang favoritku.</p>
            <p className="letter-closing">Hari ini kamu yang ulang tahun.<br />Tapi aku yang merasa beruntung.</p>
            <div className="letter-signature"><span className="handwritten">I LOVE YOUUUU, Cenat Cenut Cinut.</span><span aria-hidden="true">♡</span></div>
            <button className="close-letter" type="button" onClick={onClose}>Lipat lagi suratnya <span aria-hidden="true">↗</span></button>
          </article>
  );
}
