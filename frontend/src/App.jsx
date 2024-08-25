import { Route, Routes } from "react-router-dom"
import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/login/LoginPage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import SideBar from "./components/common/SideBar";
import RightPanel from "./components/common/RightPanel";

function App() {
  return (
    <div className='flex max-w-6xl mx-auto'>
		<SideBar/>
		<Routes>
			<Route path='/' element={<HomePage />} />
			<Route path='/signup' element={<SignUpPage />} />
			<Route path='/login' element={<LoginPage />} />
		</Routes>
		<RightPanel/>
	</div>
  )
}

export default App;
