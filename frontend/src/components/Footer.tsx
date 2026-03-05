import React from 'react';
import logoIcon from '../assets/images/logo.png';
import logoGsd from '../assets/images/logo-gsd.png'; 

const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-dark text-slate-400 py-16 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 items-start">
          
          {/* Logo & Deskripsi */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-4 mb-8">
              <img 
                src={logoIcon} 
                alt="Logo Kabupaten Garut" 
                className="h-14 w-auto brightness-0 invert opacity-90" 
              />
              <div className="h-10 w-px bg-white/10"></div>
              <img 
                src={logoGsd} 
                alt="Logo Garut Satu Data" 
                className="h-12 w-auto brightness-0 invert opacity-90" 
              />
            </div>
            <p className="text-sm leading-relaxed opacity-70 max-w-md">
            Bidang Penyelenggaraan Statistik Sektoral merupakan unit kerja pada Dinas Komunikasi dan Informatika Kabupaten Garut yang bertugas mengoordinasikan pengelolaan data sektoral antar perangkat daerah dalam rangka mendukung kebijakan berbasis data.            </p>
          </div>

          {/* Navigasi Cepat */}
          <div>
            <h4 className="text-white font-black mb-6 uppercase tracking-[0.2em] text-[10px]">Navigasi</h4>
            <ul className="space-y-3 text-sm font-bold">
              <li>
                <a href="https://satudata.garutkab.go.id/" target="_blank" rel="noreferrer" className="hover:text-brand-primary transition-colors flex items-center gap-2">
                   Portal Satu Data
                </a>
              </li>
              <li>
                <a href="https://garutkab.go.id" target="_blank" rel="noreferrer" className="hover:text-brand-primary transition-colors">
                  Web Pemerintah Daerah
                </a>
              </li>
              <li>
                <a href="/#kegiatan" className="hover:text-brand-primary transition-colors">
                  Daftar Statistik Sektoral
                </a>
              </li>
            </ul>
          </div>

          {/* Kontak & Alamat */}
          <div>
            <h4 className="text-white font-black mb-6 uppercase tracking-[0.2em] text-[10px]">Hubungi Kami</h4>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Email Resmi</p>
                <p className="text-sm font-bold text-slate-200">diskominfo@garutkab.go.id</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Alamat Kantor</p>
                <p className="text-xs leading-relaxed opacity-80 font-medium">
                  Diskominfo Kabupaten Garut <br />
                  Jl. Pembangunan No. 181, Sukagalih, Kec. Tarogong Kidul, <br />
                  Kabupaten Garut, Jawa Barat 44151
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-white/5 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-black tracking-[0.3em] uppercase opacity-30">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <p>&copy; {new Date().getFullYear()} PEMKAB GARUT</p>
            <p>Dikelola oleh Diskominfo</p>
          </div>
          <p>Bidang Statistik Sektoral</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;