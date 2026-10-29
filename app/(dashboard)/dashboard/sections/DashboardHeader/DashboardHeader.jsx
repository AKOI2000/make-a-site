
import Image from "next/image";
import "./DashboardHeader.scss";

export default function DashboardHeader({ user }) {
  const name = user?.name || "User";
  const image = user?.image;
  

  return (
    <header className="dashboard-header">
      <div className="dashboard-header__text">
        <h1 className="dashboard-header__title">Dashboard</h1>

        <p className="dashboard-header__description">
          Here&lsquo;s a little overview of your gift websites.
        </p>
      </div>

      <div className="dashboard-header__profile">
        {image ? (
          <Image
            className="dashboard-header__avatar"
            src={image}
            alt={name}
            height={50}
            width={50}
          />
        ) : (
          <div
            className="dashboard-header__avatar dashboard-header__avatar--fallback"
            aria-label={`${name}'s profile`}
          >
            {name.trim().charAt(0).toUpperCase() || "U"}
          </div>
        )}
      </div>
    </header>
  );
}
