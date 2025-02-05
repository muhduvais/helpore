
import { useState } from 'react';
import { Link } from 'react-router-dom';

const UserProfileOptions: React.FC = () => {

    const [options, setOptions] = useState({
        info: true,
        changePassword: false,
        settings: false
    })

    const handleOptions = (value: string) => {
        setOptions({
            info: value === 'info',
            changePassword: value === 'changePassword',
            settings: value === 'settings',
        });
    };

    return (
        <div className="flex flex-col items-center justify-center rounded-lg shadow gap-y-2">
            <Link to="/user/profile"><button onClick={() => handleOptions('info')} className={`px-5 py-2 ${options.info ? 'bg-[#435D2C]' : 'bg-[#688D48]'} text-sm text-white w-[200px] rounded`}>Your Info</button></Link>
            <Link to="/user/profile/changePassword"><button onClick={() => handleOptions('changePassword')} className={`px-5 py-2 ${options.changePassword ? 'bg-[#435D2C]' : 'bg-[#688D48]'} text-sm text-white w-[200px] rounded`}>Change Password</button></Link>
            <Link to="/user/profile/settings"><button onClick={() => handleOptions('settings')} className={`px-5 py-2 ${options.settings ? 'bg-[#435D2C]' : 'bg-[#688D48]'} text-sm text-white w-[200px] rounded`}>Settings</button></Link>
        </div>
    );

}

export default UserProfileOptions;