import React from 'react'
import Sidebar from './Sidebar'
import Chat from './Chat'

function Home({messages}) {
    return (
        <div className="app__body">
            <Sidebar />
          <Chat messages={messages} /> 
        </div>
    )
}

export default Home
