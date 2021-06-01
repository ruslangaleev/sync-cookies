using System;
using System.Collections.Generic;
using System.Text;

namespace SyncCookies.Models
{
    public class Page<T>
    {
        public int PageNumber { get; set; }

        public int PageCount { get; set; }

        public List<T> Data { get; set; }

        public int TotalCount { get; set; }
    }
}
