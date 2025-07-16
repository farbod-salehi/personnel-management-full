using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.Models
{
    public class UserToken
    {
        #region Properties

        public Guid Id { get; set; }

        [Required, MaxLength(450)]
        public required string UserId { get; set; }

        [Required, MaxLength(512)]
        public required string HashedToken { get; set; }

        public DateTime? ExpiredAt { get; set; }

        #endregion Properties

        #region Navigations

        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }

        #endregion Navigations
    }
}
