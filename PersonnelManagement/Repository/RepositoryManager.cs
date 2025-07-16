using Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repository
{
    public class RepositoryManager(RepositoryContext repositoryContext)
    {
        private readonly RepositoryContext _repositoryContext = repositoryContext;

        private UserRepository? _userRepository;
        private UserTokenRepository? _userTokenRepository;
        private InitInfoRepository? _initInfoRepository;
        private PersonnelRepository? _personnelRepository;

        public async Task SaveAsync() => await _repositoryContext.SaveChangesAsync();

        public UserRepository User
        {
            get
            {
                _userRepository ??= new(_repositoryContext);

                return _userRepository;
            }
        }

        public UserTokenRepository UserToken
        {
            get
            {
                _userTokenRepository ??= new(_repositoryContext);

                return _userTokenRepository;
            }
        }

        public InitInfoRepository InitInfo
        {
            get
            {
                _initInfoRepository ??= new(_repositoryContext);

                return _initInfoRepository;
            }
        }

        public PersonnelRepository Personnel
        {
            get
            {
                _personnelRepository ??= new (_repositoryContext);

                return _personnelRepository;
            }
        }
    }
}
