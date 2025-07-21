using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.Models
{
    public class Personnel
    {
        #region Properties

        public Guid Id { get; set; }

        [Required, MaxLength(50)]
        public required string ShomarePersonneli { get; set; }

        [Required, MaxLength(255)]
        public required string FirstName { get; set; }

        [Required, MaxLength(255)]
        public required string LastName { get; set; }

        public required Guid EblaghDakheliAsliId { get; set; }

        public string? SayerSematha { get; set; }

        [MaxLength(50)]
        public string? CodeMeli { get; set; }

        [MaxLength(255)]
        public string? VahedKhedmat { get; set; }

        public required bool IsSetad { get; set; } 

        public required bool IsMale { get; set; }

        public Guid? MadrakTahsiliId { get; set; }

        public Guid? ReshteTahsiliId { get; set; }

        public Guid? NoeEstekhdamId { get; set; }

        public Guid? PostId { get; set; }

        public Guid? ReshteShoghliId { get; set; }

        public Guid? MojtameGhazaiyId { get; set; }

        public Guid? ShahrMahalKhedmatId { get; set; }

        [MaxLength(50)]
        public string? TarikhAghazKhedmat { get; set; }

        public int? NoeMahalKhedmat { get; set; }

        public required DateTime CreatedAt { get; set; }

        [Required, MaxLength(450)]
        public required string CreatedBy { get; set; }

        public DateTime? DeletedAt { get; set; }

        [MaxLength(450)]
        public string? DeletedBy { get; set; }

        #endregion Properties

        #region Navigations

        [ForeignKey(nameof(EblaghDakheliAsliId))]
        public virtual InitInfo? EblaghDakheli { get; set; }

        [ForeignKey(nameof(MadrakTahsiliId))]
        public virtual InitInfo? MadrakTahsili { get; set; }

        [ForeignKey(nameof(ReshteTahsiliId))]
        public virtual InitInfo? ReshteTahsili { get; set; }

        [ForeignKey(nameof(ShahrMahalKhedmatId))]
        public virtual InitInfo? ShahrMahalKhedmat { get; set; }

        [ForeignKey(nameof(NoeEstekhdamId))]
        public virtual InitInfo? NoeEstekhdam { get; set; }

        [ForeignKey(nameof(PostId))]
        public virtual InitInfo? Post { get; set; }

        [ForeignKey(nameof(ReshteShoghliId))]
        public virtual InitInfo? ReshteShoghli { get; set; }

        [ForeignKey(nameof(MojtameGhazaiyId))]
        public virtual InitInfo? MojtameGhazaiy { get; set; }

        #endregion Navigations


    }
}
