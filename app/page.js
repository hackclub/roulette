import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (

    <div className={styles.page}>
      <main className={styles.main}>


        <img src="/logo.png" className={styles.mainLogo}/>

        <p>spin wheels. make games. get prizes.</p>
        <p>starts 8 august.</p>

        <a className="button" style={{
          marginTop: 32,
        }} href="https://hackclub.slack.com/archives/C0997MH9QF2" target="_blank">join #roulette on slack</a>


      </main>

    </div>
  );
}
