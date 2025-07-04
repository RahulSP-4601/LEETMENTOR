// 1) Home page for LeetMentor

// src/pages/Home.jsx
import { Link } from 'react-router-dom'
import Navbar from '../components/navbar.jsx'
import './../css/home.css'

export default function Home() {
  return (
    <div className='container'>
        <Navbar />
        <div className='part1'>
            <div className='logo-header'>LEETMENTOR</div>
        </div>
        
        <div className='part2'>
            USE AI FOR
            <div className='list'>
                <div className='list-item'>
                    <span className="checkmark">✅</span>
                    <span>Learning DSA</span>
                </div>
                <div className='list-item'>
                    <span className="checkmark">&nbsp;&nbsp; ✅</span>
                    <span>Mock Interview</span>
                </div>
            </div>
        </div>
    </div>
  )
}
