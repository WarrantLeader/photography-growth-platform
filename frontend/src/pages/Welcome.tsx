import { useNavigate, Link } from "react-router-dom";

import { Brand, Icon } from "../components/UI";
export default function Welcome() {
  const navigate = useNavigate();
  return (
    <div className="login-page">
      <div className="login-art">
        <Brand />
        <div>
          <div className="eyebrow">BUILT AROUND YOUR NEXT SHOOT</div>
          <h1>
            Less admin.
            <br />
            More time
            <br />
            behind the lens<span>.</span>
          </h1>
          <p>
            Your enquiries, projects and files.
            <br />
            One place to keep things moving.
          </p>
        </div>
        <small>PHOTOGRAPHY · BRISTOL & LONDON</small>
      </div>
      <div className="login-side">
        <div className="login-box">
          <div className="eyebrow">MR T CAPTURES</div>
          <h1>
            Welcome back<span>.</span>
          </h1>
          <p>Open your studio workspace.</p>
          <div className="notice">
            Sign in with your preferred account to manage your photography
            workspace, client projects and invoices.
          </div>
          <button className="primary full" onClick={() => navigate("/login")}>
            Enter workspace
            <Icon name="arrow" size={17} />
          </button>
          <Link className="text-link" to="/forgot-password">
            About account access
          </Link>
        </div>
      </div>
    </div>
  );
}
