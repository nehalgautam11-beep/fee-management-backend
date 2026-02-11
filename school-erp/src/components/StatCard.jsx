import { motion } from "framer-motion"

export default function StatCard({title,value}){

  return(
    <motion.div 
      className="card"
      whileHover={{scale:1.05}}
      initial={{opacity:0,y:20}}
      animate={{opacity:1,y:0}}
    >
      <h4>{title}</h4>
      <h2>{value}</h2>
    </motion.div>
  )
}
